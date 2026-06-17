import IDEWorkspace from "@/components/ide/IDEWorkspace";
import { Helmet } from "react-helmet";

const IDE = () => {
  return (
    <>
      <Helmet>
        <title>CodeOrbit IDE | Build Your Project</title>
        <meta
          name="description"
          content="The CodeOrbit IDE workspace — write real code with Orbit AI guidance. No shortcuts, just skill transfer."
        />
      </Helmet>
      <IDEWorkspace />
    </>
  );
};

export default IDE;
