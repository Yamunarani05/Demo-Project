
import { UserRole } from "@prisma/client";
import prisma from "../config/prisma";
export class DashboardService {

  // Dashboard Count
  static async totalCount(){
    const leadCount = await prisma.leadsDetail.count({
     where: { isDeleted: false,
          },
    });
    const employeeCount = await prisma.employeesDetail.count({
      where: { 
        isDeleted: false,
     
           },});
    const invoiceCount = await prisma.packageInvoice.count({
      where: { 
        isRemoved: false,

        status: {
          not:{
            equals: 'rejected'
          }
        }
           },});
    return {
        leadCount,
        employeeCount,
        invoiceCount
    }
    
  }
   static async EmployeeProject(limit:number,skip:number){
    const pageSize = limit || 10;
    const pageSkip = skip || 0;
    
    const employeeProject=await prisma.employeesDetail.findMany(
        {
            skip:pageSkip,
            take:pageSize,
              where:{ 
                isDeleted: false,
                leadAssignments:{
                    
                  some:{
                    lead: {
                      isDeleted: false
                    }
                  }
                }
              },
        select:{
            firstName:true,
            lastName:true,
            leadAssignments:{
                take:1,
                select:{  
                   lead:{
                    select:{
                        budget:true,
                        eventDate:true,
                        status:true,
                        currentStage:true
                    }
                   } 
                }
            }
        }
        
   })
    
    const totalCount = await prisma.employeesDetail.count({
      where: {
        isDeleted: false,
        leadAssignments: {
          some: {
            lead: {
              isDeleted: false
            }
          }
        }
      }
    });
    
    return {
       employeeProject,
       pagination: {
         total: totalCount,
         limit: pageSize,
         skip: pageSkip,
         pages: Math.ceil(totalCount / pageSize)
       }
    }
    
  }
 static async Performance(type:string){ 
    let whereCondition={};
    console.log('type',type);
    if(type=='week'){
        whereCondition={
            createdTime:{
                gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
        }
    }else if(type=='month'){
        whereCondition={
            createdTime:{
                gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
            }
        }
    }else if(type=='year'){
        whereCondition={
            createdTime:{
                gte:new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }}}
    const performance=await prisma.leadsDetail.findMany(
        {
            where:{ 
              isDeleted: false, 
                // status: 'confirmed'
                ...whereCondition

        },
        select:{
            createdTime:true,
        },
        orderBy:{ createdTime:'asc' }
   })
   if(type=='week'){
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const ret:{day:string | undefined, count:number}[] = [];
       performance.forEach((item) => {
        if(item?.createdTime){
        const day = item?.createdTime.getDay(); // Get the day of the week (0-6)
        const existingDay = ret.find((d) => d.day === days[day]);
        if (existingDay) {

            existingDay.count += 1;
        } else {
            ret.push({ day: days[day], count: 1 });    
        }  
    }})
    return {
    performance:ret
    }
   }else if(type=='month'){
    console.log('month');
    const ret:{day:string | undefined, count:number}[] = [];
    var months = [ "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" ];
         performance.forEach((item) => {

        if(item?.createdTime){
        const date = item?.createdTime.getMonth(); // Get the date of the month (1-31)
        const existingDate = ret.find((d) => d.day === months[date]);
        if (existingDate) {

            existingDate.count += 1;
        } else {
            ret.push({ day: months[date], count: 1 });    
        } 
        }
         })
         return{
            performance:ret
         }
}else if(type=='year'){
    const ret:{day:string | undefined, count:number}[] = [];
         performance.forEach((item) => {
        if(item?.createdTime){
        const date = item?.createdTime.getFullYear(); // Get the date of the month (1-31)
        const existingDate = ret.find((d) => d.day === date.toString());
        if (existingDate) {
            existingDate.count += 1;
        }
        else{
            ret.push({ day: date.toString(), count: 0 });
        }}}         
    )
    return{
            performance:ret
         }
            }

    return {
    
    }
    
  }
}
