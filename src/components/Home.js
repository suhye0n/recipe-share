import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { getDocs, query, collection, where } from 'firebase/firestore';
import styled from 'styled-components';

const HomeContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
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
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  border: 1px solid #dee2e6;
  margin-top: 20px;
  font-weight: bold;
  background: #357abD !important;
  color: #fff !important;

  &:hover {
  }
`;

const Home = () => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentCounts, setCommentCounts] = useState({});
    const location = useLocation();

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

    const filterRecipes = (recipes, query) => {
        return recipes.filter((recipe) =>
            recipe.title.toLowerCase().includes(query.toLowerCase())
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
        <HomeContainer>
            <WriteButton to="/write">레시피 등록</WriteButton>
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
                        {filterRecipes(recipes, searchQuery).map((recipe) => (
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
        </HomeContainer>
    );
};

export default Home;
