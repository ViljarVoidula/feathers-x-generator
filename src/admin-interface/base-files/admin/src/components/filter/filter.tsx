import {
    Form,
    Input,
    Button,
    FormProps,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
;

export const Filter: React.FC<{ formProps: FormProps }> = ({ formProps }) => {
    return (
        <Form layout="vertical" {...formProps}>
            <Form.Item label="Search" name="q">
                <Input
                    placeholder="ID, Title, Content, etc."
                    prefix={<SearchOutlined />}
                />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" type="primary">
                    Filter
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Filter;
