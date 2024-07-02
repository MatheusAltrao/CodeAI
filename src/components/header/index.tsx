const Header = () => {
  return (
    <header className="border-b  p-4 flex flex-col gap-1 ">
      <h1 className="text-3xl ">
        Code <span className="underline decoration-blue-500 underline-offset-4 ">IA</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Faça perguntas para a nossa IA especialista em programação.
      </p>
    </header>
  );
};

export default Header;
