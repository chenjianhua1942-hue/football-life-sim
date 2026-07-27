import "./globals.css";

export const metadata = {
  title: "足球百态｜试玩版",
  description: "从4岁开始，踢出只属于你的足球人生。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
