import {Link} from 'react-router-dom';
import { UserContext } from './UserContext';
import { useContext, useEffect, useState } from 'react';

export default function Header() {
    const {userInfo, setUserInfo} = useContext(UserContext);
    useEffect(() => {
        fetch("http://localhost:4000/profile", {
            credentials: "include",
        }).then((res) => {
            res.json().then(userInfo => {
                setUserInfo(userInfo);
            })
        })
    }, []);

    function logout() {
        fetch("http://localhost:4000/logout", {
            credentials: "include",
            method: "POST",
        });
        setUserInfo(null);
    }

    const username = userInfo ? userInfo.username : null;

    return (
        <header>
            <Link to="/" className='logo'> BLOOGER </Link>
            <nav>
                {username && (
                    <>
                        <Link to="/create">Create new post</Link>
                        <a onClick={logout}>Logout ({username})</a>
                    </>
                )}
                {!username && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    )

} 