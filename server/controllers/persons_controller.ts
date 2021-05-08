import * as model from './model';

exports.getPersons = async function (request, response) {
  const persons = await model.Person.findAll();
  response.json(persons);
};
