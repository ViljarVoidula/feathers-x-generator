import React from "react";
import { IResourceComponentsProps, BaseRecord, CrudFilters } from "@refinedev/core";
import { useTable, List, EditButton, ShowButton } from "@refinedev/antd";
import { Table, Space, Row, Col, Card } from "antd";
import Filter from "components/filter/filter";

export const CarList: React.FC<IResourceComponentsProps> = () => {
    const { tableProps, searchFormProps } = useTable({
        syncWithLocation: true,
        onSearch:(params: any) =>{
          const filters: CrudFilters = [];
          const { q, brand } = params;
      
          filters.push({
            field: "q",
            operator: "contains",
            value: q
          },{
            field: "brand",
            operator: "eq",
            value: brand
          })
          return filters;
        }
    });

    return (
      <>
      <Row gutter={[16,16]}>
        <Col lg={6} xs={24}>
          <Card title={"Filters"}>
            <Filter formProps={searchFormProps}/>
          </Card>
        </Col>
        <Col lg={12}>
        <List>
          <Table {...tableProps} rowKey="id">
                 <Table.Column dataIndex="id" title="Id" />
                <Table.Column dataIndex="brand" title="Brand" />
                 <Table.Column
                     title="Actions"
                     dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <Space>
                             <EditButton
                                 hideText
                                 size="small"
                                 recordItemId={record.id}
                             />
                             <ShowButton
                                 hideText
                                 size="small"
                                 recordItemId={record.id}
                             />
                         </Space>
                     )}
                 />
             </Table>
         </List>
      </Col>
      </Row>
  
      </>


    );
};
