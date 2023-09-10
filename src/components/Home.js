import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';
import styled from 'styled-components';
import { PiPencilLineLight } from 'react-icons/pi';

const HomeContainer = styled.div`
    width: 80%;
    max-width: 800px;
    margin: 0 auto;
    margin-top: -150px;
    z-index: 10;
    position: relative;
`;

const ContainerBox = styled.div`
    padding: 20px;
    border-radius: 10px;
    box-shadow: 1px 1px 1px 1px #FF7895;
    background-color: #fff;
    margin-bottom: 20px;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    text-align: center;
`;

const TableHeader = styled.th`
  padding: 10px;
  fort-weight: bold;
  border-bottom: 1px solid #dee2e6;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
  }
`;

const TableCell = styled.td`
  padding: 10px;
  border-bottom: 1px solid #dee2e6;
`;

const TitleLink = styled(Link)`
  text-decoration: none;
`;

const WriteButton = styled(Link)`
  position: fixed;
  right: 40px;
  bottom: 40px;
  box-shadow: 1px 1px 1px 1px #FF7895;
  padding: 15px 20px;
  text-decoration: none;
  border-radius: 50px;
  border: 1px solid #dee2e6;
  margin-top: 20px;
  font-weight: bold;
  background: #FF7895;
  
  * {
    color: #fff;
    font-size: 30px;
  }

  &:hover {
    opacity: 0.7;
  }
`;

const Home = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentCounts, setCommentCounts] = useState({});
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    const fetchRecipes = async () => {
        try {
            const recipesData = await getDocs(query(collection(db, 'recipes')));
            const recipesArray = [];

            recipesData.forEach((recipeDoc) => {
                recipesArray.push({
                    id: recipeDoc.id,
                    ...recipeDoc.data(),
                });
            });

            setRecipes(recipesArray);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching recipes:', error);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    const searchQuery = new URLSearchParams(location.search).get('search') || '';
    const category = new URLSearchParams(location.search).get('category') || '';
    
    const filterRecipes = (recipes, query, category) => {
        return recipes.filter((recipe) =>
          recipe.title.toLowerCase().includes(query.toLowerCase()) && (!category || recipe.category === category)
        );
    };

    const getCommentCount = async (recipeId) => {
        const commentsQuery = query(
            collection(db, 'comments'),
            where('recipeId', '==', recipeId)
        );

        const commentsData = await getDocs(commentsQuery);
        return commentsData.size;
    };

    useEffect(() => {
        const fetchCommentCounts = async () => {
            const counts = {};
            for (const recipe of recipes) {
                const count = await getCommentCount(recipe.id);
                counts[recipe.id] = count;
            }
            setCommentCounts(counts);
        };

        fetchCommentCounts();
    }, [recipes]);

    return (
        <>
            <HomeContainer>
                <ContainerBox>
                    <h2>소개</h2>
                    <p>음식 레시피 공유 플랫폼, <u>레시피 공유</u>입니다.</p>
                    <h2>설명서</h2>
                    <ul>
                        <li>로그인을 하여 레시피와 댓글을 작성해보세요!</li>
                        <li>궁금한 레시피를 검색해보세요!</li>
                    </ul>
                </ContainerBox>
                <ContainerBox>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : (
                        <Table>
                            <thead>
                                <tr>
                                    <TableHeader>제목</TableHeader>
                                    <TableHeader>작성자</TableHeader>
                                    <TableHeader>댓글 수</TableHeader>
                                </tr>
                            </thead>
                            <tbody>
                                {filterRecipes(recipes, searchQuery, category).map((recipe) => (
                                    <TableRow key={recipe.id}>
                                        <TableCell>
                                            <TitleLink to={`view?id=${recipe.id}`}>
                                                {recipe.title}
                                            </TitleLink>
                                        </TableCell>
                                        <TableCell>{recipe.user}</TableCell>
                                        <TableCell>{commentCounts[recipe.id]}</TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </Table>
                    )}
                    <WriteButton to="/write"><PiPencilLineLight /></WriteButton>
                </ContainerBox>
            </HomeContainer>
        </>
    );
};

export default Home;
