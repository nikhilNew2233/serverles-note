'use strict';
import 'dotenv/config';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from 'uuid';

// Verify environment variables are set
if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_CLIENT_ID) {
  throw new Error('Missing Cognito configuration in environment variables');
}

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID,
  clientId: process.env.COGNITO_CLIENT_ID,
  tokenUse: 'id'
});

// Create Note
export const createNote = async (event) => {
  try {
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const payload = await verifier.verify(token);
    const { title, content } = JSON.parse(event.body);

    const note = {
      noteId: uuidv4(),
      userId: payload.sub,
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: process.env.NOTES_TABLE,
      Item: note
    }));

    return {
      statusCode: 201,
      body: JSON.stringify(note)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Get All Notes for User
export const getAllNotes = async (event) => {
  try {
    const token = event.headers.Authorization?.replace('Bearer ', '');
    const payload = await verifier.verify(token);

    const { Items } = await docClient.send(new ScanCommand({
      TableName: process.env.NOTES_TABLE,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': payload.sub
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(Items || [])
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};