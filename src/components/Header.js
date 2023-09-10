import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaUtensils, FaBars } from 'react-icons/fa';
import { FiUser, FiLogOut, FiLogIn, FiSearch, FiX } from 'react-icons/fi';
import { MdCardMembership } from 'react-icons/md';

const Backdrop = styled.div`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 998;
`;

const HeaderContainer = styled.div`
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  display: flex;
  padding: ${(props) => (props.scroll ? '0 12px' : '0 48px 195px 48px')};
  justify-content: space-between;
  align-items: center;
  background-color: #ff7895;
  border-radius: ${(props) => (props.scroll ? '0' : '0 0 50% 50%')};
  transition: all 0.4s;
  z-index: ${(props) => (props.scroll ? '30' : '1')};
`;

const CategoryIcon = styled(FaBars)`
  font-size: 1.5rem;
  cursor: pointer;
  color: #f9f9f9;
`;

const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: ${(props) => (props.show ? '0' : '-400px')};
  height: 100%;
  width: 300px;
  background-color: #ff7895;
  transition: all 0.4s;
  z-index: 999;
  padding: 50px 30px;
`;

const Category = styled.h1`
  display: block;
  font-size: 1.5rem;

  * {
    color: #f9f9f9 !important;
  }
`;

const SearchModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, ${(props) => (props.show ? '-50%' : '550%')});
  width: 80%;
  max-width: 400px;
  background-color: #FF7895;
  padding: 50px 20px;
  border-radius: 10px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.4s ease-in-out;
  z-index: 1000;

  input {
    background: transparent !important;
    max-width: calc(100% - 40px) !important;
  }

  * {
    color: #fff !important;
  }
`;

const CloseModalButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const CloseIcon = styled(FiX)`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #f9f9f9;
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

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  padding: 5px 10px 5px 36px;
  border: none;
  border-radius: 5px;
  width: 300px;
  font-size: 1rem;
  background: #f4f4f4;
`;

const SearchButton = styled(Link)`
  display: none;
  position: fixed;
  left: 40px;
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

  @media (max-width: 768px) {
    display: block;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  color: #FF7895;
`;

const MyPageLink = styled(Link)`
  text-decoration: none;
  font-size: 1rem;
  margin-left: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;

  &:hover {
    text-decoration: underline;
  }
  
  * {
    color: #f9f9f9 !important;
    margin-left: 13px;
  }
`;

const LogoutIcon = styled.span`
  margin-left: 5px;
  color: #f9f9f9;
`;

const LoginIcon = styled(FiLogIn)`
  color: #f9f9f9;
  margin-left: 20px;
  cursor: pointer;
  font-size: 24px;
`;

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [showSidebar, setShowSidebar] = useState(false);
    const [scroll, setScroll] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const toggleModal = () => {
        setShowModal(!showModal);
    };

    let lastScrollY = 0;
    let ticking = false;

    const update = () => {
        setScroll(window.scrollY > 10);
        ticking = false;
    };

    const requestTick = () => {
        if (!ticking) {
            requestAnimationFrame(update);
        }
        ticking = true;
    };

    useEffect(() => {
        const onScroll = () => {
            lastScrollY = window.scrollY;
            requestTick();
        };

        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

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
        <>
            <Backdrop show={showSidebar || showModal} />
            <Sidebar show={showSidebar}>
                <Category>
                    <Link to="/"><FaUtensils color="#f9f9f9" /> 홈</Link>
                </Category>
                <CloseIcon onClick={toggleSidebar} />
            </Sidebar>
            <HeaderContainer scroll={scroll}>
                <CategoryIcon onClick={toggleSidebar} />
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
                    <MyPageLink to="/signup">
                        <MdCardMembership size={24} />
                        <LoginIcon onClick={() => navigate('/login')}>
                        </LoginIcon>
                    </MyPageLink>
                )}
            </HeaderContainer>
            <SearchModal show={showModal}>
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
                <CloseModalButton onClick={toggleModal}>
                    <FiX />
                </CloseModalButton>
            </SearchModal>
            <SearchButton onClick={toggleModal}><FiSearch /></SearchButton>
        </>
    );
};

export default Header;
