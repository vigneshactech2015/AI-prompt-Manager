<script>
    import '../login/login.css';
    import {goto} from '$app/navigation';
    import {SIGNUP_ENDPOINT} from '../../lib/utils/endpoint';
    import { error } from '@sveltejs/kit';
    import axios from 'axios';

    let username = '';
    let password = '';
    let loading = false;
    let errorMessage = '';
    let successMessage = '';

    async function handleSignup(){
        if(!username||!password){
            errorMessage = 'Please fill in both username and password';
            return
        }

        loading = true;
        errorMessage = '';
        successMessage = '';

        try{
            const response = await axios.post(SIGNUP_ENDPOINT,{
                userName:username,
                password
            })

            if(response?.data?.data?.message){
                successMessage = 'Sign up successful . Now Go back to Login page';

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
        handleSignup()
    }

</script>

<svelte:head>
	<title>Prompt Manager</title>
	<meta name="login" content="Prompt Manager Sign up" />
</svelte:head>


      <a class="back-section" href="/login">
        <span>←</span>
        Back to Login
      </a>  

<section>
    
	<div class="login-container">
		
        <h1>PM Tool</h1>


		
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
				{loading ? 'Signing up...' : 'Sign Up'}
			</button>

            	
		</form>

      
		
	</div>
     
</section>

