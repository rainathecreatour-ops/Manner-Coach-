export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <style global jsx>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          height: 100%;
          background: #fdf6f0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #4a3728;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
