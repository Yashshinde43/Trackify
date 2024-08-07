import { NextResponse } from "next/server";
import { getLowestPrice, getHighestPrice, getAveragePrice } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct } from "@/lib/scraper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
    try {
        await connectToDB();

        const products = await Product.find({});
        if (!products) throw new Error("No product fetched");

        const batchSize = 10; // Process 10 products at a time
        const updatedProducts = [];

        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            const updatedBatch = await Promise.all(
                batch.map(async (currentProduct) => {
                    // Scrape product
                    const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

                    if (!scrapedProduct) return;

                    const updatedPriceHistory = [
                        ...currentProduct.priceHistory,
                        { price: scrapedProduct.currentPrice },
                    ];

                    const product = {
                        ...scrapedProduct,
                        priceHistory: updatedPriceHistory,
                        lowestPrice: getLowestPrice(updatedPriceHistory),
                        highestPrice: getHighestPrice(updatedPriceHistory),
                        averagePrice: getAveragePrice(updatedPriceHistory),
                    };

                    const updatedProduct = await Product.findOneAndUpdate(
                        { url: product.url },
                        product,
                        { new: true } // Return the updated document
                    );

                    return updatedProduct;
                })
            );
            updatedProducts.push(...updatedBatch);
        }

        return NextResponse.json({
            message: "Ok",
            data: updatedProducts.filter(Boolean), // Remove any null or undefined values
        });
    } catch (error: any) {
        throw new Error(`Failed to update products: ${error.message}`);
    }
}
