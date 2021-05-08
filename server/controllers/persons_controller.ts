import * as model from './model';

export const getPersons = async (request: Record<string, any>, response: Record<string, any>): Promise<void> => {
  const persons = await model.Person.findAll();
  response.json(persons);
};
