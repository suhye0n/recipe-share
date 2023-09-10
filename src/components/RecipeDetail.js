import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import {
    collection,
    doc,
    getDoc,
    addDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot,
    deleteDoc,
} from 'firebase/firestore';

const DetailContainer = styled.div`
    width: 80%;
    max-width: 800px;
    margin: 0 auto;
    margin-top: -150px;
    padding: 20px;
    z-index: 10;
    position: relative;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px #FF7895;
    background-color: #fff;
`;

const RecipeTitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 10px;
`;

const RecipeInfo = styled.div`
    margin-bottom: 20px;
`;

const InfoLabel = styled.span`
    font-weight: bold;
    margin-right: 5px;
`;

const RecipeImage = styled.img`
    max-width: 100%;
    height: auto;
    margin-top: 20px;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
`;

const CommentSection = styled.div`
    margin-top: 20px;
`;

const CommentList = styled.ul`
    list-style: none;
    padding: 0;
`;

const CommentItem = styled.li`
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CommentText = styled.p`
    margin: 0;
`;

const CommentForm = styled.form`
    margin-top: 20px;
`;

const CommentTextarea = styled.textarea`
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
`;

const CommentButton = styled.button`
    display: block;
    margin-top: 10px;
    padding: 10px 20px;
    border: 1px solid #eee;
    border-radius: 5px;
    cursor: pointer;
    background-color: #357abD;
    color: #fff;
`;

const EditButtons = styled.div`
    display: flex;
    align-items: center;
`;

const EditButton = styled.button`
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 5px 10px;
    margin-right: 10px;
    cursor: pointer;
    background-color: transparent;
`;

const DeleteButton = styled.button`
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
    background-color: transparent;
`;

const RecipeDetail = () => {
    const location = useLocation();
    const id = new URLSearchParams(location.search).get('id');
    const [recipe, setRecipe] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [storedUser, setStoredUser] = useState(null);

    useEffect(() => {
        const userFromLocalStorage = JSON.parse(localStorage.getItem('user'));
        setStoredUser(userFromLocalStorage);
        setIsLoggedIn(!!userFromLocalStorage);
    }, []);

    const fetchRecipe = async () => {
        try {
            const recipeDoc = await getDoc(doc(db, 'recipes', id));
            if (recipeDoc.exists()) {
                setRecipe({
                    id: recipeDoc.id,
                    ...recipeDoc.data(),
                });
            } else {
                console.error('레시피를 찾을 수 없음');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchComments = () => {
        const commentsQuery = query(
            collection(db, 'comments'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            const commentsArray = [];
            snapshot.forEach((commentDoc) => {
                const commentData = commentDoc.data();
                if (commentData.recipeId === id) {
                    commentsArray.push({
                        id: commentDoc.id,
                        ...commentData,
                    });
                }
            });
            setComments(commentsArray);
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribeComments = fetchComments();
        fetchRecipe();

        return () => {
            unsubscribeComments();
        };
    }, [id]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (newComment.trim() === '') {
            return;
        }

        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const nickname = storedUser ? storedUser.nickname : 'Anonymous';

            await addDoc(collection(db, 'comments'), {
                recipeId: id,
                user: nickname,
                text: newComment,
                timestamp: serverTimestamp(),
            });

            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const navigate = useNavigate();

    const handleEditRecipe = () => {
        if (storedUser && storedUser.uid === recipe.userUid) {
            navigate(`/write?id=${recipe.id}`);
        } else {
            alert('수정할 권한이 없습니다.');
        }
    };

    const handleDeleteRecipe = async () => {
        if (storedUser && storedUser.uid === recipe.userUid) {
            try {
                await deleteDoc(doc(db, 'recipes', recipe.id));
                alert('성공적으로 삭제되었습니다.');
                navigate('/');
            } catch (error) {
                console.error(error);
            }
        } else {
            alert('삭제할 권한이 없습니다.');
        }
    };

    const canEditOrDelete = storedUser && storedUser.uid === recipe?.userUid && storedUser.nickname === recipe?.user;

    return (
        <DetailContainer>
            {recipe ? (
                <div>
                    <RecipeTitle>{recipe.title}</RecipeTitle>
                    {isLoggedIn && canEditOrDelete && (
                        <EditButtons>
                            <EditButton onClick={handleEditRecipe}>수정</EditButton>
                            <DeleteButton onClick={handleDeleteRecipe}>삭제</DeleteButton>
                        </EditButtons>
                    )}
                    <RecipeInfo>
                        <InfoLabel>작성자:</InfoLabel> {recipe.user}
                    </RecipeInfo>
                    <RecipeInfo>
                        <InfoLabel>설명:</InfoLabel> {recipe.description}
                    </RecipeInfo>
                    <RecipeInfo>
                        <InfoLabel>재료:</InfoLabel> {recipe.ingredients}
                    </RecipeInfo>
                    <RecipeInfo>
                        <InfoLabel>단계:</InfoLabel> {recipe.steps}
                    </RecipeInfo>
                    <RecipeImage src={recipe.imageURL} alt={recipe.title} />
                </div>
            ) : (
                <p>해당하는 글이 없습니다.</p>
            )}

            <CommentSection>
                <h3>Comments</h3>
                <CommentList>
                    {comments.map((comment) => (
                        <CommentItem key={comment.id}>
                            <CommentText>
                                {comment.user}: {comment.text}
                            </CommentText>
                        </CommentItem>
                    ))}
                </CommentList>
                {isLoggedIn && (
                    <CommentForm onSubmit={handleCommentSubmit}>
                        <CommentTextarea
                            rows="4"
                            cols="50"
                            placeholder="댓글을 남겨주세요."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></CommentTextarea>
                        <CommentButton type="submit">댓글 남기기</CommentButton>
                    </CommentForm>
                )}
            </CommentSection>
        </DetailContainer>
    );
};

export default RecipeDetail;
