"use client"

import ProductCard from "./ProductCard"
import { products } from "../data/products"

const Section = ({ title, category, categoryId, addToCart, limit = null, navigateToCategory }) => {
  let filteredProducts = category === "all" ? products : products.filter((product) => product.category === category)

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit)
  }

  const handleViewMore = () => {
    if (categoryId && navigateToCategory) {
      navigateToCategory(categoryId)
    } else if (navigateToCategory) {
      // For "all" categories, navigate without specific category filter
      navigateToCategory(null)
    }
  }

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

          <button onClick={handleViewMore} className="text-red-600 hover:text-red-700 font-medium">
            Xem thêm →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Section
