import { test, expect } from '../../fixtures/userContextFixture';
import { loadTestData } from '../../utils/loadTestData';
import { APIRoutes } from '../../utils/constants/routes';
import { ArticleData, createUniqueArticle } from '../../utils/types/articleData';
import { APIRequestContext } from '@playwright/test';

let unpublishedArticleData: ArticleData;
let unpublishedArticleId: number;

let publishedArticleData: ArticleData;
let publishedArticleId: number;

/**
 * Users endpoint testing with external test data modified to be unique,
 * and created once to be reused to avoid reaching API key request limit.
 * This test suite verifies articles and information tied to a specific user. 
 */
test.describe('Users API', () => {

    /**
     * Setting up test data only once to ensure valid and unique data is available for the tests.
     * Mitigates the risk of reaching API key request limit (instead of creating this data inside individual tests). 
     */
    test.beforeAll(async ({ authorizedRequest }) => {
        unpublishedArticleData = createUniqueArticle(loadTestData('newArticle.json'));
        publishedArticleData = createUniqueArticle(loadTestData('publishedArticle.json'));

        // Creating unpublished article
        const unpublishedArticleResponseBody = await uploadArticle(authorizedRequest, unpublishedArticleData);
        unpublishedArticleId = unpublishedArticleResponseBody.id;

        // Creating published article
        const publishedArticleResponseBody = await uploadArticle(authorizedRequest, publishedArticleData);
        publishedArticleId = publishedArticleResponseBody.id;
    });

    /**
     * Retrieving a list of published & unpublished articles should be possible for a valid user with authorization
     */
    test('Should get list of all user\'s articles given authorized user', async ({ authorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await authorizedRequest.get(APIRoutes.AllUserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(200);

        const userArticlesResponseBody = await userArticlesResponse.json();

        const unpublishedArticle = userArticlesResponseBody.find((article: any) => article.id === unpublishedArticleId);
        expect(unpublishedArticle).toBeTruthy();

        const publishedArticle = userArticlesResponseBody.find((article: any) => article.id === publishedArticleId);
        expect(publishedArticle).toBeTruthy();
    });

    /**
     * Retrieving a list of published & unpublished articles should only be possible when valid authorization is provided
     */
    test('Should not get list of all of user\'s articles given unauthorized user', async ({ unauthorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await unauthorizedRequest.get(APIRoutes.AllUserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(401);

        const userArticlesResponseBody = await userArticlesResponse.json();
        expect(userArticlesResponseBody).toHaveProperty('error');
        expect(userArticlesResponseBody.error).toBe('unauthorized');
    });


    /**
     * Retrieving a list of published articles should be possible for a valid user with authorization
     */
    test('Should get list of user\'s published articles given authorized user', async ({ authorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await authorizedRequest.get(APIRoutes.UserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(200);

        const userArticlesResponseBody = await userArticlesResponse.json();

        const publishedArticle = userArticlesResponseBody.find((article: any) => article.id === publishedArticleId);
        expect(publishedArticle).toBeTruthy();

        const unpublishedArticle = userArticlesResponseBody.find((article: any) => article.id === unpublishedArticleId);
        expect(unpublishedArticle).toBeFalsy();
    });

    /**
     * Retrieving a list of published articles should only be possible when valid authorization is provided
     */
    test('Should not get list of user\'s published articles given unauthorized user', async ({ unauthorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await unauthorizedRequest.get(APIRoutes.UserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(401);

        const userArticlesResponseBody = await userArticlesResponse.json();
        expect(userArticlesResponseBody).toHaveProperty('error');
        expect(userArticlesResponseBody.error).toBe('unauthorized');
    });

    /**
     * Retrieving a list of unpublished articles should be possible for a valid user with authorization
     */
    test('Should get list of user\'s unpublished articles given authorized user', async ({ authorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await authorizedRequest.get(APIRoutes.UnpublishedUserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(200);

        const userArticlesResponseBody = await userArticlesResponse.json();

        const unpublishedArticle = userArticlesResponseBody.find((article: any) => article.id === unpublishedArticleId);
        expect(unpublishedArticle).toBeTruthy();

        const publishedArticle = userArticlesResponseBody.find((article: any) => article.id === publishedArticleId);
        expect(publishedArticle).toBeFalsy();
    });

    /**
     * Retrieving a list of unpublished articles should only be possible when valid authorization is provided
     */
    test('Should not get list of user\'s unpublished articles given unauthorized user', async ({ unauthorizedRequest }) => {
        // Given & When
        const userArticlesResponse = await unauthorizedRequest.get(APIRoutes.UnpublishedUserArticles);

        // Then
        expect(userArticlesResponse.status()).toBe(401);

        const userArticlesResponseBody = await userArticlesResponse.json();
        expect(userArticlesResponseBody).toHaveProperty('error');
        expect(userArticlesResponseBody.error).toBe('unauthorized');
    });

    /**
     * Retrieving information about the user should be possible for a valid user with authorization
     */
    test('Should get information about the user given authenticated user', async ({ authorizedRequest }) => {
        // Given & When
        const userResponse = await authorizedRequest.get(APIRoutes.User);

        // Then
        expect(userResponse.status()).toBe(200);

        const userResponseBody = await userResponse.json();
        expect(userResponseBody).toHaveProperty('id');
        expect(userResponseBody.id).toBeTruthy();

        expect(userResponseBody).toHaveProperty('type_of');
        expect(userResponseBody.type_of).toBe('user');
    });

    /**
     * Retrieving information about the user should only be possible when valid authorization is provided
     */
    test('Should not get information about the user given unauthorized user', async ({ unauthorizedRequest }) => {
        // Given & When
        const userResponse = await unauthorizedRequest.get(APIRoutes.User);

        // Then
        expect(userResponse.status()).toBe(401);

        const userResponseBody = await userResponse.json();
        expect(userResponseBody).toHaveProperty('error');
        expect(userResponseBody.error).toBe('unauthorized');
    });

    /**
     * Uploads the provided article data to create an article on the given user's profile.
     * Facilitates the creation of test data for this test suite to ensure a given user has uploaded articles.
     * 
     * @param authorizedRequest an APIRequestContext associated with the user's profile (via API key)
     * @param articleData data used to upload the article
     * @returns response body with the article
     */
    async function uploadArticle(authorizedRequest: APIRequestContext, articleData: ArticleData): Promise<any> {
        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        expect(articleResponse.status()).toBe(201);

        const articleResponseBody = await articleResponse.json();
        expect(articleResponseBody).toHaveProperty('id');
        expect(articleResponseBody.id).toBeTruthy();

        return articleResponseBody;
    };

});
