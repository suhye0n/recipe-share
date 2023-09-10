import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

const Title = styled.h1`
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #ff7895;
`;

const Input = styled.input`
  padding: 14px;
  margin: 8px 0;
  width: 300px;
  border: 1px solid #eee;
  border-radius: 5px;
`;

const Button = styled.button`
padding: 0.5rem 1rem;
font-size: 1rem;
background-color: #ff7895;
color: white;
border: none;
border-radius: 0.3rem;
transition: 0.4s;
cursor: pointer;
&:hover {
  opacity: 0.7;
}
`;

const ErrorMsg = styled.p`
  color: red;
  margin: 0;
`;

const AlreadyMember = styled.p`
  margin-top: 20px;
  font-size: 0.9em;
`;

const StyledLink = styled(Link)`
font-weight: 600;
text-decoration: underline;
color: #ff7895 !important;
transition: 0.4s;
&:hover {
  opacity: 0.7;
}
`;

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(null);
  const [nicknameError, setNicknameError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const nicknameQuery = query(collection(db, "users"), where("nickname", "==", nickname));
      const nicknameQuerySnapshot = await getDocs(nicknameQuery);
      if (!nicknameQuerySnapshot.empty) {
        setNicknameError("이미 사용 중인 닉네임입니다.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        nickname,
      });
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container>
      <Title>회원가입</Title>
      <Input
        type="text"
        placeholder="닉네임"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
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
      <Input
        type="password"
        placeholder="비밀번호 재입력"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
      {nicknameError && <ErrorMsg>{nicknameError}</ErrorMsg>}
      <Button onClick={handleSignup}>회원가입</Button>
      <AlreadyMember>
        이미 회원가입 하셨나요? <StyledLink to="/login">로그인 페이지로 이동</StyledLink>
      </AlreadyMember>
    </Container>
  );
};

export default Signup;