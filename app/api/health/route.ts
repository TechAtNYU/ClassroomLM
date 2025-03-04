export async function GET() {
  return Response.json({
    status: "OK",
    secret_env_test: process.env.SECRET_TEST,
  });
}
