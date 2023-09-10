import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { db } from '../firebase';
import {
    collection,
    doc,
    getDoc,
    addDoc,
    query,
    orderBy,
    updateDoc,
    serverTimestamp,
    onSnapshot,
    deleteDoc,
} from 'firebase/firestore';

const DetailContainer = styled.div`
    width: 80%;
    max-width: 800px;
    margin: 0 auto;
    margin-top: -150px;
    margin-bottom: 70px;
    padding: 20px;
    z-index: 10;
    position: relative;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px #FF7895;
    background-color: #fff;
`;

const LikeButton = styled.button`
    display: block;
    margin: 30px auto;
    border: none;
    background: transparent;
    font-size: 24px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.4s;
    * {color: ${props => props.liked ? '#FF7895' : '#eee'};}
    span {
        margin-left: -18px;
        color: #000;
    }
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
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #FF7895;
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
    background-color: #FF7895;
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
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => {
        const userFromLocalStorage = JSON.parse(localStorage.getItem('user'));
        console.log(userFromLocalStorage);
        setStoredUser(userFromLocalStorage);
        setIsLoggedIn(!!userFromLocalStorage);
    }, []);

    const fetchRecipe = async () => {
        try {
            const recipeDoc = await getDoc(doc(db, 'recipes', id));
            if (recipeDoc.exists()) {
                const recipeData = recipeDoc.data();
                setRecipe({
                    id: recipeDoc.id,
                    ...recipeData,
                });
                
                setLiked(recipeData.likedBy?.includes(storedUser?.uid) || false);
                setLikeCount(recipeData.likedBy?.length || 0);
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

    const handleDeleteComment = async (commentId) => {
        try {
            const userInput = window.prompt("삭제하시려면 예를 입력해주세요.");
            if (userInput === "예") {
                await deleteDoc(doc(db, 'comments', commentId));
                alert('댓글이 삭제되었습니다.');
            }
        } catch (error) {
            console.error(error);
        }
    };

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
            console.error(error);
        }
    };

    const navigate = useNavigate();

    const handleEditRecipe = () => {
        navigate(`/write?id=${recipe.id}`);
    };

    const handleDeleteRecipe = async () => {
        try {
            const userInput = window.prompt("삭제하시려면 예를 입력해주세요.");
            if (userInput === "예") {
                await deleteDoc(doc(db, 'recipes', recipe.id));
                alert('성공적으로 삭제되었습니다.');
                navigate('/');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLike = async () => {
        if (!isLoggedIn || !recipe) {
            return;
        }
    
        if (!storedUser || !storedUser.nickname) {
            return;
        }
    
        try {
            const recipeDocRef = doc(db, 'recipes', recipe.id);
            let updatedLikedBy = recipe.likedBy || [];
    
            if (liked) {
                updatedLikedBy = updatedLikedBy.filter(nickname => nickname !== storedUser.nickname);
            } else {
                if (!updatedLikedBy.includes(storedUser.nickname)) {
                    updatedLikedBy.push(storedUser.nickname);
                }
            }
    
            await updateDoc(recipeDocRef, {
                likedBy: updatedLikedBy,
            });
    
            setLiked(!liked);
            setLikeCount(updatedLikedBy.length);
    
        } catch (error) {
            console.error(error);
        }
    };    
    
    const canEditOrDelete = storedUser?.nickname === recipe?.user;

    return (
        <DetailContainer>
            {recipe ? (
                <div>
                    <RecipeTitle>{recipe.title}</RecipeTitle>
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
                    <LikeButton 
                        onClick={handleLike} 
                        liked={liked}
                    >
                        {liked ? <FaHeart /> : <FaRegHeart />}
                        <span>{likeCount}</span>
                    </LikeButton>
                    {isLoggedIn && canEditOrDelete && (
                        <EditButtons>
                            <EditButton onClick={handleEditRecipe}>
                                <FaEdit /> 수정
                            </EditButton>
                            <DeleteButton onClick={handleDeleteRecipe}>
                                <FaTrashAlt /> 삭제
                            </DeleteButton>
                        </EditButtons>
                    )}
                </div>
            ) : (
                <p>해당하는 글이 없습니다.</p>
            )}

            <CommentSection>
                <h3>댓글</h3>
                <CommentList>
                    {comments.map((comment) => (
                        <CommentItem key={comment.id}>
                            <CommentText>
                                {comment.user}: {comment.text} <br/>
                                {comment.timestamp?.toDate().toLocaleString()}
                            </CommentText>
                            {storedUser?.nickname === comment.user && (
                                <DeleteButton onClick={() => handleDeleteComment(comment.id)}>
                                    <FaTrashAlt /> 삭제
                                </DeleteButton>
                            )}
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
