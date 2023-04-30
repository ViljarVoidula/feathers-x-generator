import { assert, expect, test } from 'vitest'
import { getFilters, getSorting } from './dataprovider'

test('generateFilters handles crud filters', () => {
    const filters = [
           {
        field: "name",
        operator: "eq",
        value: "John",
    },
    {
        field: "age",
        operator: "lt",
        value: 30,
    },
    {
        field: "height",
        operator: "gte",
        value: 50,
    },
    ]
    
    const result = getFilters(filters);
    assert.deepEqual(result, { name: { __eq: 'John' }, age: { __lt: 30 }, height: { __gte: 50 } }, 'generateFilters handles crud filters')
})   

test('generateFilters handles logical filters', () => {
    const filters = [
        {
            operator: "or",
            value: [
                {
                    operator: "and",
                    value: [
                        {
                            field: "name",
                            operator: "eq",
                            value: "John Doe",
                        },
                        {
                            field: "age",
                            operator: "eq",
                            value: 30,
                        },
                    ],
                },
                {
                    operator: "and",
                    value: [
                        {
                            field: "name",
                            operator: "eq",
                            value: "JR.Doe",
                        },
                        {
                            field: "age",
                            operator: "eq",
                            value: 1,
                        },
                    ],
                },
            ],
        }
    ]

    const result = getFilters(filters);
    assert.deepEqual(result, {__or:{__and:{name:{__eq:"JR.Doe"},age:{__eq:1}}}})

})  

test('data provider sorting is applied correctly', () => {
    const sorters = [
        {
            field: "name",
            order: "asc",
        }
    ]

    const result = getSorting(sorters);

    assert.deepEqual(result, { name: 1 })

})