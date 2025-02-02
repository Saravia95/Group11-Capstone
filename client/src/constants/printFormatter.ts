export const PRINT_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <title>Print QR Code</title>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .box {
        border: 3px solid #000;
        padding: 10px 40px 40px 40px;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>&#9835; JukeVibes</h1>
    <div class="box">
      <p>Scan this QR code to access the app</p>
      <div>{{SVG_CONTENT}}</div>
    <div>
  </body>
</html>
`;
