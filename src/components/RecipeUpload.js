import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useLocation } from 'react-router-dom';

const storage = getStorage();

const Container = styled.div`
width: 80%;
max-width: 800px;
margin: 0 auto;
margin-top: -150px;
padding: 50px 20px;
z-index: 10;
position: relative;
border-radius: 10px;
box-shadow: 1px 1px 1px 1px #FF7895;
background-color: #fff;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  width: 80%;
  border: 1px solid #ff7895;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  width: 80%;
  height: 100px;
  border: 1px solid #ff7895;
  border-radius: 5px;
  resize: none;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #ff7895;
  color: #fff;
  border: 1px solid #ff7895;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }
`;

const FileInput = styled.input`
  margin-bottom: 1rem;
`;

const RecipeUpload = () => {
  const location = useLocation();
  const id = new URLSearchParams(location.search).get('id');
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const nickname = storedUser ? storedUser.nickname : 'Anonymous';
  const [formData, setFormData] = useState({
    user: nickname,
    title: '',
    description: '',
    ingredients: '',
    steps: '',
    image: null,
  });

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const recipeDoc = await getDoc(doc(db, 'recipes', id));
          if (recipeDoc.exists()) {
            const recipeData = recipeDoc.data();
            setFormData({
              user: nickname,
              title: recipeData.title || '',
              description: recipeData.description || '',
              ingredients: recipeData.ingredients || '',
              steps: recipeData.steps || '',
              image: null,
            });
          } else {
            console.error('레시피를 찾을 수 없습니다.');
          }
        } catch (error) {
          console.error(error);
        }
      };
      fetchRecipe();
    }
  }, [id, nickname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });
  };

  const uploadImage = async () => {
    const filePath = `recipes/${formData.image.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, formData.image);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const uploadedImageURL = await uploadImage();

      if (id) {
        const recipeDocRef = doc(db, 'recipes', id);
        await updateDoc(recipeDocRef, {
          title: formData.title,
          description: formData.description,
          ingredients: formData.ingredients,
          steps: formData.steps,
          imageURL: uploadedImageURL,
        });
        alert('레시피가 수정되었습니다.');
      } else {
        await addDoc(collection(db, 'recipes'), {
          user: nickname,
          title: formData.title,
          description: formData.description,
          ingredients: formData.ingredients,
          steps: formData.steps,
          imageURL: uploadedImageURL,
        });
        alert('레시피가 등록되었습니다.');
      }

      setFormData({
        user: nickname,
        title: '',
        description: '',
        ingredients: '',
        steps: '',
        image: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          placeholder="제목"
          value={formData.title}
          onChange={handleInputChange}
        />
        <TextArea
          name="description"
          placeholder="설명"
          value={formData.description}
          onChange={handleInputChange}
        />
        <TextArea
          name="ingredients"
          placeholder="재료"
          value={formData.ingredients}
          onChange={handleInputChange}
        />
        <TextArea
          name="steps"
          placeholder="요리 순서"
          value={formData.steps}
          onChange={handleInputChange}
        />
        <FileInput type="file" onChange={handleFileChange} />
        <Button type="submit">완료</Button>
      </Form>
    </Container>
  );
};

export default RecipeUpload;
