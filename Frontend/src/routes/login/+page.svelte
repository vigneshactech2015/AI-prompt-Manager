<script>
    import './login.css';
    import {goto} from '$app/navigation';
    import {LOGIN_ENDPOINT} from '../../lib/utils/endpoint';
    import {userStore} from '$lib/stores/index.js';
    import { error } from '@sveltejs/kit';
    import axios from 'axios';

    let username = '';
    let password = '';
    let loading = false;
    let errorMessage = '';
    let successMessage = '';

    async function handleLogin(){
        if(!username||!password){
            errorMessage = 'Please fill in both username and password';
            return
        }

        loading = true;
        errorMessage = '';
        successMessage = '';

        try{
            const response = await axios.post(LOGIN_ENDPOINT,{
                userName:username,
                password
            })

            console.log('response',response)

            if(response?.data?.data?.token){
                successMessage = 'Login successful! Redirecting ...';
                localStorage.setItem('token',response.data.data.token);

                const userInfo = {
                    username:username,
                    userId:username,
                    token:response?.data?.data?.token
                }

                userStore.set(userInfo)

                goto("/prompt")
            }else {
                errorMessage = response.data?.data.message
            }
        }catch(err){
            console.log('login error',err)
            errorMessage = err.response.data.data.message ||  'Network error . Please try again.'
        }finally{
            loading = false;
        }
    }

    function handleSubmit(event){
        event.preventDefault();
        handleLogin()
    }
</script>

<svelte:head>
	<title>Login</title>
	<meta name="login" content="Login page" />
</svelte:head>


<section>
	<div class="login-container">
		<h1>Login</h1>
		
		<form on:submit={handleSubmit} class="login-form">
			<div class="form-group">
				<label for="username">Username</label>
				<input 
					type="text" 
					id="username" 
					bind:value={username}
					placeholder="Enter your username"
					disabled={loading}
					required
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input 
					type="password" 
					id="password" 
					bind:value={password}
					placeholder="Enter your password"
					disabled={loading}
					required
				/>
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			{#if successMessage}
				<div class="success-message">
					{successMessage}
				</div>
			{/if}

			<button 
				type="submit" 
				class="login-btn"
				disabled={loading}
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</button>

            	
		</form>

      
		
	</div>
      <span
			class="signup-btn"
			>
				{'New user ? Register Here !'}
</span>
</section>

