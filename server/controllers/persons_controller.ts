import * as model from './model';

export const getPersons = async (request, response) => {
  const persons = await model.Person.findAll();
  response.json(persons);
};
