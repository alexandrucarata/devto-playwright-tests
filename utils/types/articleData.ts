import { v4 as uuid } from 'uuid';

export interface ArticleData {
    article: {
        title: string;
        body_markdown: string;
        published: boolean;
        series: string;
        main_image: string;
        canonical_url: string;
        description: string;
        tags: string;
        organization_id: number;
    };
}

/**
 * Workaround function for test data clean-up limitation.
 * Creates a unique article from the provided ArticleData
 * 
 * @param articleData provided ArticleData object with generic data
 * @returns new ArticleData object with unique data
 */
export function createUniqueArticle(articleData: ArticleData): ArticleData {
    return {
        ...articleData,
        article: {
            ...articleData.article,
            title: `${articleData.article.title} - ${uuid()}`,
        },
    };
}
