import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiLogIn, FiSearch } from 'react-icons/fi';

const HeaderContainer = styled.div`
    z-index: 999;
    position: sticky;
    position: -webkit-sticky;
    height: 70px;
    top: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 0 48px;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  color: #333;
  transition: all 0.4s;
  background-color: #357abD;
`;

const Title = styled.h1`
color: #f4f4f4;
  font-size: 1.5rem;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  display: block;
  padding: 8px 12px;
  border: 1px solid #eee;
  border-radius: 50px;
  transition: all .4s;
  background: #f4f4f4;
`;

const SearchInput = styled.input`
  padding: 5px 10px 5px 36px;
  border: none;
  border-radius: 5px;
  width: 300px;
  font-size: 1rem;
  background: #f4f4f4;
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
`;

const MyPageLink = styled(Link)`
  text-decoration: none;
  color: #f9f9f9;
  font-size: 1rem;
  margin-left: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
`;

const LogoutIcon = styled.span`
  margin-left: 5px;
  color: #f9f9f9;
`;

const LoginIcon = styled(FiLogIn)`
    color: #f9f9f9 !important;
  font-size: 24px;
  margin-left: 20px;
  cursor: pointer;
`;

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);
    }, []);

    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim() === '') {
            return;
        }
        navigate(`/?search=${searchTerm}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        alert('로그아웃이 완료되었습니다.');
    };

    return (
        <HeaderContainer>
            <Link to="/"><Title>
                레시피공유</Title>
            </Link>
            <SearchContainer>
                <SearchIcon />
                <form onSubmit={handleSearchSubmit}>
                    <SearchInput
                        type="text"
                        placeholder="레시피 검색"
                        value={searchTerm}
                        onChange={handleSearchInputChange}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearchSubmit(e);
                            }
                        }}
                    />
                </form>
            </SearchContainer>
            {isLoggedIn ? (
                <MyPageLink to="/mypage">
                    <FiUser size={24} />
                    <LogoutIcon onClick={handleLogout}>
                        <FiLogOut size={24} />
                    </LogoutIcon>
                </MyPageLink>
            ) : (
                <LoginIcon onClick={() => navigate('/login')} />
            )}
        </HeaderContainer>
    );
};

export default Header;
