import React, { useState } from 'react';
import styled from 'styled-components';
import { FaCookieBite } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Link, useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Icon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #f89f13;
`;

const Input = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #eee;
  border-radius: 5px;
  width: 300px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #357abD;
  color: white;
  border: none;
  border-radius: 0.3rem;
`;

const NoMember = styled.p`
  margin-top: 20px;
  font-size: 0.9em;
`;

const StyledLink = styled(Link)`
  font-weight: 600;
  text-decoration: underline;
  color: #4a90e2;
  &:hover {
    color: #357abd;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);

      let nickname = '';
      querySnapshot.forEach((doc) => {
        nickname = doc.data().nickname;
      });

      localStorage.setItem('user', JSON.stringify({ nickname: nickname }));

      alert('로그인이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Container>
      <Icon>
        <FaCookieBite />
      </Icon>
      <Title>로그인</Title>
      <Input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin}>로그인</Button>
      <NoMember>
        회원이 아니신가요? <StyledLink to="/signup">회원가입 페이지로 이동</StyledLink>
      </NoMember>
    </Container>
  );
};

export default Login;
