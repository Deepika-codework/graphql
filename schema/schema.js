const graphQL = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphQL;
const { _ } = require("lodash")
const axios = require('axios');
const { computeHeadingLevel } = require('@testing-library/react');

const user = [
    {
        "id": "40",
        "firstName": "Alex",
        "age": 40,
        "companyId": "2"
    },
    {
        "id": "41",
        "firstName": "Nick",
        "age": 40,
        "companyId": "2"
    },
    {
        "firstName": "Samantha",
        "age": 25,
        "companyId": "1",
        "id": "S1TKHzuwl"
    }
]

const UserType = new GraphQLObjectType({
    name: "user",
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`).then(res => res.data)
            }
        }

    })
})

const CompanyType = new GraphQLObjectType({
    name: "company",
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then(res => res.data)
            }
        }
    })
})



const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                //return _.find(user,{id:args.id}); -- within app
                //from out side server for eg: from json-server
                return axios.get(`http://localhost:3000/users/${args.id}`).then(res => res.data)
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`).then(res => res.data)
            }
        }

    }
})


const mutation = new GraphQLObjectType({
    name: "MutationType",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { firstName, age, companyId }) {
                return axios.post(`http://localhost:3000/users`, { firstName, age, companyId }).then(res => res.data)
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }},
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`).then(res => res.data)
            }
        },
        updateUser:{
            type:UserType,
            args:{firstName:{type:GraphQLString},age:{type:GraphQLInt},id:{type:new GraphQLNonNull(GraphQLString)}},
            resolve(parentValue,{firstName,age,id}){
                return axios.put(`http://localhost:3000/users/${id}`,{firstName,age}).then(res => res.data)
            }
        },
       partialUpdateUser:{
            type:UserType,
            args:{firstName:{type:GraphQLString},age:{type:GraphQLInt},id:{type:new GraphQLNonNull(GraphQLString)}},
            resolve(parentValue,{firstName,age,id}){
                return axios.patch(`http://localhost:3000/users/${id}`,{firstName,age}).then(res => res.data)
            }
        }

    }
})



module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})