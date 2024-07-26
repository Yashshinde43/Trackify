import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";
import { getEmailNotifType } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await connectToDB();

        const products = await Product.find({});
        if (!products) throw new Error("No product fetched");

        await Promise.all(
            products.map(async (updatedProduct) => {
                const emailNotifType = getEmailNotifType(updatedProduct, updatedProduct); // Simplified for example

                if (emailNotifType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    };

                    const emailContent = await generateEmailBody(productInfo, emailNotifType);
                    const userEmails = updatedProduct.users.map((user: any) => user.email);

                    await sendEmail(emailContent, userEmails);
                }
            })
        );

        return NextResponse.json({
            message: "Emails sent",
        });
    } catch (error: any) {
        throw new Error(`Failed to send emails: ${error.message}`);
    }
}
