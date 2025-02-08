import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';
dotenv.config();

const client = new CognitoIdentityProviderClient({ 
  region: process.env.AWS_REGION || 'ap-south-1'  // Fallback to 'ap-south-1' if AWS_REGION is not set
});

async function main() {
  try {
    // Create user
    // await client.send(new AdminCreateUserCommand({
    //   UserPoolId: process.env.COGNITO_USER_POOL_ID,
    //   Username: 'testuser@example.com',
    //   TemporaryPassword: 'TempPass123!',
    //   UserAttributes: [
    //     { Name: 'email', Value: 'testuser@example.com' },
    //     { Name: 'email_verified', Value: 'true' }
    //   ]
    // }));

    // // Set permanent password
    // await client.send(new AdminSetUserPasswordCommand({
    //   UserPoolId: process.env.COGNITO_USER_POOL_ID,
    //   Username: 'testuser@example.com',
    //   Password: 'PermPass123!',
    //   Permanent: true
    // }));

    // Get tokens
    const authResponse = await client.send(new AdminInitiateAuthCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: 'testuser@example.com',
        PASSWORD: 'PermPass123!'
      }
    }));

    console.log('ID Token:', authResponse.AuthenticationResult.IdToken);
    console.log("hello Manual Approverere");
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 