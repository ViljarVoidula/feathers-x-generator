import { AuthPage, ThemedTitleV2 } from "@refinedev/antd";
import { AppIcon } from "components/app-icon";

export const Login = () => {
  return (
    <AuthPage
      type="login"
      title={
        <ThemedTitleV2 collapsed={false} text="admin" icon={<AppIcon />} />
      }
      formProps={{
        initialValues: { email: "", password: "" },
      }}
    />
  );
};

