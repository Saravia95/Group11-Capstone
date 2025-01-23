import React, {  } from 'react';
import NowPlaying from './NowPlaying';
// import { useNavigate } from 'react-router';

const ListenerMain: React.FC = () => {
    // const navigate = useNavigate();

    // const handleSubmit = (event: React.FormEvent) => {
    //     event.preventDefault();
    //     // Add your code validation logic here
    //    // navigate('/listener');
    // };


    // const navigateToOwnerLogin = () => {
    //     navigate('/owner-login');
    // };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'auto' }}>
         <NowPlaying/>
        </div>
    );
};

export default ListenerMain;