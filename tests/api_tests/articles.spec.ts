import { test, expect } from '../../fixtures/userContextFixture';
import { loadTestData } from '../../utils/loadTestData';
import { APIRoutes } from '../../utils/constants/routes';
import { ArticleData, createUniqueArticle } from '../../utils/types/articleData';

let newArticleData: ArticleData;
let publishedArticle: ArticleData;

/**
 * Articles endpoint testing with external test data modified to be unique,
 * avoiding duplicates to work around the limitations of not being allowed 
 * to delete created articles without Admin or Moderator API keys
 */
test.describe('Articles API', () => {

    test.beforeAll(async () => {
        newArticleData = loadTestData('newArticle.json');
        publishedArticle = loadTestData('publishedArticle.json');
    });

    /**
     * Creating articles should be possible for a valid user with authorization
     */
    test('Should publish article given authorized user', async ({ authorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(newArticleData);

        // When
        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        // Then
        expect(articleResponse.status()).toBe(201);

        const responseBody = await articleResponse.json();

        expect(responseBody).toHaveProperty('id');
        expect(responseBody.id).toBeTruthy();

        expect(responseBody).toHaveProperty('title');
        expect(responseBody.title).toBe(articleData.article.title);

        expect(responseBody).toHaveProperty('url');
        expect(responseBody.url).toBeTruthy();
    });

    /**
     * Creating articles should only be possible when valid authorization is provided
     */
    test('Should not publish article given unauthorized user', async ({ unauthorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(newArticleData);

        // When
        const articleResponse = await unauthorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        // Then
        expect(articleResponse.status()).toBe(401);

        const responseBody = await articleResponse.json();
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toBe('unauthorized');
    });

    /**
     * Retrieving articles should be possible without authorization
     */
    test('Should retrieve article by id', async ({ authorizedRequest, unauthorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(publishedArticle);

        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        expect(articleResponse.status()).toBe(201);
        const articleResponseBody = await articleResponse.json();

        // When
        const getArticleResponse = await unauthorizedRequest.get(`${APIRoutes.Articles}/${articleResponseBody.id}`);

        // Then
        expect(getArticleResponse.status()).toBe(200);

        const getArticleResponseBody = await getArticleResponse.json();

        expect(getArticleResponseBody).toHaveProperty('id');
        expect(getArticleResponseBody.id).toBe(articleResponseBody.id);

        expect(getArticleResponseBody).toHaveProperty('url');
        expect(getArticleResponseBody.url).toBe(articleResponseBody.url);
    });

    /**
     * Updating articles should be possible for a valid user with authorization
     */
    test('Should update article by id given authorized user', async ({ authorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(newArticleData);

        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        expect(articleResponse.status()).toBe(201);
        const articleResponseBody = await articleResponse.json();

        // When
        const updateArticleResponse = await authorizedRequest.put(`${APIRoutes.Articles}/${articleResponseBody.id}`, {
            data:
            {
                "article": {
                    "published": true,
                }
            }
        });

        // Then
        expect(updateArticleResponse.status()).toBe(200);

        const updateArticleResponseBody = await updateArticleResponse.json();
        expect(updateArticleResponseBody).toHaveProperty('published_at');
        expect(updateArticleResponseBody.published_at).toBeTruthy();
    });

    /**
     * Updating articles should only be possible when valid authorization is provided
     */
    test('Should not update article by id given unauthorized user', async ({ authorizedRequest, unauthorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(newArticleData);

        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        expect(articleResponse.status()).toBe(201);
        const articleResponseBody = await articleResponse.json();

        // When
        const updateArticleResponse = await unauthorizedRequest.put(`${APIRoutes.Articles}/${articleResponseBody.id}`, {
            data:
            {
                "article": {
                    "published": true,
                }
            }
        });

        // Then
        expect(updateArticleResponse.status()).toBe(401);

        const updateArticleResponseBody = await updateArticleResponse.json();
        expect(updateArticleResponseBody).toHaveProperty('error');
        expect(updateArticleResponseBody.error).toBe('unauthorized');
    });

    /**
     * Only Admins and Moderators can unpublish articles.
     * Since the API key is associated to a regular user, 
     * we expect to be denied when trying to unpublish articles
     */
    test('Should not unpublish article given user is not admin', async ({ authorizedRequest }) => {
        // Given
        const articleData = createUniqueArticle(publishedArticle);

        const articleResponse = await authorizedRequest.post(APIRoutes.Articles, {
            data: articleData,
        });

        expect(articleResponse.status()).toBe(201);
        const articleResponseBody = await articleResponse.json();

        // When
        const unpublishArticleResponse = await authorizedRequest.put(`${APIRoutes.Articles}/${articleResponseBody.id}/unpublish`);

        // Then
        expect(unpublishArticleResponse.status()).toBe(401);

        const unpublishArticleResponseBody = await unpublishArticleResponse.json();
        expect(unpublishArticleResponseBody).toHaveProperty('error');
        expect(unpublishArticleResponseBody.error).toBe('unauthorized');
    });

});
