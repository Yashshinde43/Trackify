"use client";
import { scrapeAndStoreProduct } from "@/lib/actions";
import React, { FormEvent, useState } from "react";

const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidAmazonProductLink = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const hostName = parsedUrl.hostname;

      if (
        hostName.includes("amazon.com") ||
        hostName.includes("amazon.") ||
        hostName.includes("amazon")
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isValidLink = isValidAmazonProductLink(searchPrompt);

    if (!isValidLink) {
      alert("Invalid Link");
    }

    try {
      setIsLoading(true);
      const product = await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      className="flex flex-wrap gap-4 mt-12"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Enter product link"
        className="searchbar-input"
        onChange={(e) => setSearchPrompt(e.target.value)}
        value={searchPrompt}
      />
      <button type="submit" className="searchbar-btn">
        {isLoading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
