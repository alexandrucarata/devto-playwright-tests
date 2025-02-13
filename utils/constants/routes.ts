export enum APIRoutes {
    Articles = 'articles',
    UserArticles = `${Articles}/me`,
    UnpublishedUserArticles = `${UserArticles}/unpublished`,
    AllUserArticles = `${UserArticles}/all`,
    User = 'users/me',
}
