import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

@Injectable()
export class KafkaService {
    private orderConfirmationTemplate: string;
    constructor(private readonly consumerService:ConsumerService){
        this.orderConfirmationTemplate = fs.readFileSync('/home/admin185/Desktop/Ent_Hub_Project/consumer-service/src/utils/email.html', 'utf-8');
    }
    public async fun(){
        await this.consumerService.consume(
          
          { topics: ['orders'] },
          {
              eachMessage: async({ topic, partition, message })=>{          

                const transporter = nodemailer.createTransport({
                  service: 'gmail',
                  host: 'smtp.gmail.com',
                  port: 465,
                  secure: true,
                  auth: {
                    user: 'abhijeet.srivastava@appinventiv.com',
                    pass: 'rroaiegawtshpbed',
                  },
                });
                const mailOptions = {
                  from: 'abhijeet.srivastava@appinventiv.com',
                  to: 'abhijeet.srivastava@appinventiv.com',
                  subject: 'Order confirmation email',
                  html: this.orderConfirmationTemplate.replace('{{ orderDetails }}', message.value.toString()),
        
          };
                transporter.sendMail(mailOptions, (error, info) => {
                  if (error)
                    throw new InternalServerErrorException('Error sending email');
                  else
                    console.log('Email sent: ' + info.response);
                })
              }
    
          }
      )
               
      }
}