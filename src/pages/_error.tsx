interface ErrorPageProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "4rem", textAlign: "center" }}>
      <h1>{statusCode || 500}</h1>
      <p>Something went wrong while rendering this page.</p>
    </main>
  );
}
