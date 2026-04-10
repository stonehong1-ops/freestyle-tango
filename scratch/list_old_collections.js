const admin = require('firebase-admin');

// [SOURCE] - US PROJECT
const sourceSa = {
  project_id: "tangostay-7355e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDQRZbb7zyG/p48\nlhY2tvHGvXkkbWXxyZMVHNqcRdMJYzEyZ0l0I6ifjsl35d9lLZ58W4CfSYWi5KO1\nAJWvpqFA0Z6kIBnF6Vc3ge+A6VJXRRagsKelqUTHEWOHJuKlMdGnmXXRxIU2Yiku\n/cmMWOgJ1YSL6gpCzB/T3u13lELXrlwFd3q2nkspdFUUoO8aRAk6clhaFvoMr3/H\n7ajT9qI6CAV3C9Y/YU95BjTPohhC0Gg3VpM/+OMPOXi2xkGbkb302bBS00+zbIsN\nM5oK/SCLBHb2anUg9QRDiKgugeEYH7cwJKCEpHm2M/P9sB/omLk3ehLkzmdC6r1Y\nxRhjhjdTAgMBAAECggEAZ3n7rwAY0XVVxwJGvR5912Ex/BBCczPUWMwCLVxfsq1O\ntx0sGIDS+Ztmq6RRLqLQuDZ6HCnaNIlmcLp+pEukmGDNcfvk8jixtYlgJmtGFsfj\nqyi50ovb+Q/BpFeEidDLunp7WCJMkS2KCqfa6FkPyDsGZMF+IZvrQEflMeE+qIs5\nei7Cdr8EIEf4D33QkO9TW82DoVwo0lXGqKRh3DF8Kd34VCCDLAoVYdI3UfEz/sKN\nYQjtPH7QQ8/F95j2zYAS1Oe7LiZ8kP72zssBkHXUayYyk9ApzVzuI+rxMkBuMrLs\ ZhJhgitKfhyR8Bdg34X0PJ0+DIswiP3BAZ3G53kquQKBgQD3jcF96v5cxB06HerR\n8igAiaL3eY6X2NcGn8IxV0PTqCRzrvoMR0iifoTjUyKGTpSrUPfBwWZH2FYAYPmn\nuIdlo/Yi/cnxwkPrL0kbLPU3HBUsWcAMmCP/r01R2OA/x52GfM/1p3h2XGNmTQ84\n6N8BBnHsDyYvtBzb3+1a14EgJwKBgQDXYLpYjP+xhEr4qE+TN4kypGWO4S3ZbarJ\nSOpXKUUymPK344B4XQVg7bVteXGVdfp3EEHyQre1snc9wFD/MfIymfCQM+p4izaz\nBWCvSWbDEO4JIL6F1ST9XuDj1hQZiKrEH8ByABzrnqG32XxX8pTO+r9n3UAE5IHm\mmZxSC8+9QKBgFZPxIDkqB8r+YzD1ZWxuqTFWF60sTTcU8xpc0nExU9Mtrjm7yPM\nztRpDGg+GjF9wHQi3N9fUQwHr6SeKy2BNyQHENCOcBSsyQV9DR4+hJjcX72A5Wb+\nvL5vHqRE25shPBkh91gNNgD+oWGPyJjtCKPQ3XOSrJvBTraS0qzzqn/NAoGAeo7b\nWzpY4f4C335/Uamfk8bC18xBV+G09rdcSl78tm8cZxG5cESWo/KAdBxQSxmIfiot\nLJtUiLtWaTg/nwgf5zV8E8LHIPMvHC3qN7TQGh5PJbiRUfzZAKj11hBi/aisa9AZ\npYV074skQUcsH6u1jBZZxtO6803IsZ2Yv8uwvuUCgYBFoCXepJGNiCmuodIEHqlA\nQ0LINZxU5NkESaqvdngqsl+pWO7fjnna9hFLVZKe6XnFy7wJDK2OplB0m1pnSA2a\ncm2NHuDOz+JG4oR8o3iCasVBDBbUjwAeMlUao3OdIadiMenCGniO0LJLWj7Y8Iqs\n3YtNnNohyPoLusEMqP0zdQ==\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  client_email: "firebase-adminsdk-fbsvc@tangostay-7355e.iam.gserviceaccount.com"
};

const app = admin.initializeApp({ credential: admin.credential.cert(sourceSa) });
const db = app.firestore();

async function listCollections() {
  const collections = await db.listCollections();
  console.log('--- COLLECTIONS IN OLD PROJECT ---');
  for (const c of collections) {
    const snapshot = await c.limit(1).get();
    console.log(`- ${c.id} (${snapshot.size > 0 ? 'Has Data' : 'Empty'})`);
  }
}

listCollections().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
