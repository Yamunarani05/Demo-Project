import {
getEmployeesQuery,
getEmployeeQuery,
createEmployeeQuery,
updateEmployeeQuery,
deleteEmployeeQuery
} from "../queries/employee.query"

import { CreateEmployeeDTO } from "../types/employee.types"

export const getEmployeesService = async()=>{

return await getEmployeesQuery()

}

export const getEmployeeService = async(id:string)=>{

return await getEmployeeQuery(id)

}

export const createEmployeeService = async(data: CreateEmployeeDTO)=>{
  // createEmployeeQuery handles both employee + user creation in a single transaction.
  // Do not duplicate the user-insert logic here — it causes a unique email constraint violation.
  return await createEmployeeQuery(data)
}

export const updateEmployeeService = async(id:string,data:any)=>{

return await updateEmployeeQuery(id,data)

}

export const deleteEmployeeService = async(id:string)=>{

return await deleteEmployeeQuery(id)

}
