import { useEffect, useState } from "react";

import { Routes, Route, useNavigate } from "react-router-dom";

import { postServiceFactory } from './services/postService';
import {authServiceFactory} from './services/authService';
import { AuthContext } from "./context/AuthContext";
import { useService } from "./hooks/UseService";

import Home from "./components/pages/home/Home";
import Login from "./components/pages/login/Login";
import Register from "./components/pages/register/Register";
import Settings from "./components/pages/settings/Settings";
import Single from "./components/pages/single/Single";
import Write from "./components/pages/write/Write";
import TopBar from "./components/topBar/TopBar";
import { Logout } from "./components/pages/logout/Logout";
import { EditPost } from "./components/pages/edit/EditPost";
import About from "./components/pages/about/About";



function App() {
    const navigate = useNavigate();
    const [posts, setPost] = useState([]);
    const [auth, setAuth] = useState({});
    const [account, setAccount] = useState({});
    const postService = postServiceFactory(auth.accessToken);
    const authService = authServiceFactory(auth.accessToken);
    
    useEffect(() => {
        postService.getAll()
            .then(result => {
                setPost(result)
                
            })
    }, []);

    const likeClick = async (postId, likes) => {
       
        const updatePost = await postService.edit(postId, likes, auth.accessToken);

        setPost(state => state.map(p => p._id === postId ? updatePost : p))
    };
 
    const onCreatePost = async (data) => {
        
        const newPost = await postService.create(data, auth.accessToken);

        setPost(state => [...state, newPost]);

        navigate('/');
    };

    const onEditForm = async (values) => {
        const editedPost = await postService.edit(values._id, values, auth.accessToken);

        setPost(state => state.map(x => x._id === values._id ? editedPost : x));

        navigate(`/post/${values._id}`);
    };

    
    const onLoginSubmit = async (data) => {
        try {
            const result = await authService.login(data, auth.accessToken);
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(`There is a problem`);
        }
       
    };

    const onRegisterSubmit = async (values) => {
        try {
            const result = await authService.register(values, auth.accessToken);
            setAuth(result);
            navigate('/');
        } catch (error) {
            console.log(`There is a problem`);
        }
    };

    const onLogout = async () => {
        await authService.logout(auth.accessToken);

        setAuth({});

        setAccount({});
    };

    const onAccountSettings = async (data) => {
        const result = data;
        
        setAccount(result);

        navigate('/');
    }


    const context = {
        likeClick,
        onLoginSubmit,
        onRegisterSubmit,
        onLogout,
        name: account.username,
        description: account.description,
        image: account.imageUrl,
        userId: auth._id,
        token: auth.accessToken,
        userEmail: auth.email,
        userUsername: auth.username,
        isAuth: !!auth.accessToken,
    }


    return (
        <AuthContext.Provider value={context}>
        <>
            <TopBar />
            <Routes>
                <Route path="/" element={<Home posts={posts}/>} />
                <Route path="/settings" element={<Settings onAccountSettings={onAccountSettings}/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/about" element={<About />} />
                <Route path="/write" element={<Write onCreatePost={onCreatePost}/>} />
                <Route path="/post/:postId" element={<Single />} />
                <Route path="/post/:postId/edit" element={<EditPost onEditForm={onEditForm}/>}></Route>
            </Routes>
        </>
        </AuthContext.Provider>
    );
}

export default App;
