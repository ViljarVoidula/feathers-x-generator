import { ConditionalFilter, CrudFilters, CrudOperators, CrudSorting, DataProvider, LogicalFilter } from "@refinedev/core";
import pluralize from "pluralize";
import camelCase from "camelcase";
import client from "./client";


const resourceImportMap = {
    cars: await import("../../resources/cars/cars.generated"),
    //!code resource_import_map
}


function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      function(txt: string) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

/**
 * 
 * @param operator query operator
 * @returns return mapped operator graphql compliant
 */
const mapOperator = (operator: CrudOperators|LogicalFilter | ConditionalFilter): string => {
    switch (operator) {
        case "contains":
            return "__like";
        default:
            return `__${operator}`;
    }
};

export const getFilters = (filters?: CrudFilters) => {
    const filtering: { [key: string]: any } = {};
    
    filters?.forEach((filter) => {
        if ("field" in filter) {
          const { field, operator, value } = filter;
          const mappedOperator = mapOperator(operator);
          filtering[field] = { [mappedOperator]: value };
        } else if ("operator" in filter && "value" in filter) {
          const { operator, value } = filter;
          const mappedOperator = mapOperator(operator);
          const subQueryFilters = getFilters(value);
          filtering[mappedOperator] = subQueryFilters;
        }
      });
    return filtering;
};

export const getSorting = (sorters?: CrudSorting) => {
    let sorting: { [key: string]: any } = {};
    sorters?.forEach(({ field, order }) => {
        sorting[field] = order === "asc" ? 1 : -1;
    });
    return sorting;
}

export const dataProvider = (): DataProvider => {
    return {
        getApiUrl: () => {
            throw Error("Not implemented on admin-graphql data provider.");
        },
        getList: async ({ resource, pagination, sorters, filters, meta }) => {
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            const {
                current = 1,
                pageSize = 10,
                mode = "server",
            } = pagination ?? {};
    
            const { data, error }  = await client.query(loadResourceDataConnector[`Find${toTitleCase(resource)}Document`],{
                query: {
                    ...getFilters(filters),
                    ...getSorting(sorters),
                    ...(mode === "server" && { __limit: pageSize, __skip: (current - 1) * pageSize })
                }
            })
            const resultData = data[`${camelCase(pluralize(resource))}Page`].data.map(({__typename, _id:id, ...rest}:{__typename: string, _id: string}) => ({ id, ...rest}))
    
            return {
                data: resultData,
                total: data[`${camelCase(pluralize(resource))}Page`].total
            }
        },
        getMany: async ({ resource, ids, meta }) =>{
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            const { data }  = await client.query(loadResourceDataConnector[`Find${toTitleCase(resource)}Document`],{
                query: {
                    id: {
                        __in:[...ids]
                    }
                }
            })
        
            return {
                data: data[`${camelCase(pluralize(resource))}Page`].data.map(({__typename, _id:id, ...rest }:{ __typename: string, _id: string}) => ({ id, ...rest })),
                total: data[`${camelCase(pluralize(resource))}Page`].total
            }
        },
        update: async ({ resource, id, variables, meta }) => {
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            if(!loadResourceDataConnector[`Patch${toTitleCase(pluralize.singular(resource))}Document`]) throw new Error('Update method is not available for this resource')
            //implement error for update not being available
            // @ts-ignore
            const { __typename, ...rest } = variables
            //@ts-ignore
            const { data, error: { graphQLErrors }={} } = await client.mutation(loadResourceDataConnector[`Patch${toTitleCase(pluralize.singular(resource))}Document`],{
                id,
                data: {
                    ...rest
                }
            });
    
          
            return data[`patch${camelCase(pluralize.singular(resource))}`][camelCase(pluralize.singular(resource))];
        },
        getOne: async ({ resource, id, meta }) => { 
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            //@ts-ignore
            const { data } = await client.query(loadResourceDataConnector[`FindOne${toTitleCase(pluralize.singular(resource))}Document`],{
                id,
            });
    
            return {
                data: data[`${camelCase(pluralize.singular(resource))}`]
            }  
        },
        create: async ({ resource, variables, meta }) =>  {
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            //@ts-ignore
            const { data, error: { graphQLErrors } = {} } = await client.mutation(loadResourceDataConnector[`Create${toTitleCase(pluralize.singular(resource))}Document`],{
                data: variables
            });
            return {
                data:data[`create${camelCase(pluralize.singular(resource))}`]
            };
        },
    
        deleteOne: async ({ resource, id, meta }) => {
            // @ts-expect-error
            const loadResourceDataConnector = resourceImportMap[resource];
            if(!loadResourceDataConnector[`Remove${toTitleCase(pluralize.singular(resource))}Document`]) throw new Error('Delete method is not available for this resource')
            //@ts-ignore
            const { data, error: { graphQLErrors } = {}} = await client.mutation(loadResourceDataConnector[`Remove${toTitleCase(pluralize.singular(resource))}Document`],{
                id
            });
          
            return {
                data: data[`remove${camelCase(pluralize.singular(resource))}`]
            }
        },
        //@ts-expect-error
        custom: async({ url, method, headers, meta = {} }) => {
            if(meta){
                if(meta.query){
                    const { data, error } = await client.query(meta.query, meta.variables)
                    return {
                        data
                    }
                }else if(meta.mutation){
                    const { data, error } = await client.mutation(meta.mutation, meta.variables)
                    return {
                        data
                    }
                }
            }else{
                throw new Error('Not implemented')
            }
        }
    }
};