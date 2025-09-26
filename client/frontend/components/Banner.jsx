const Banner = () => {
  return (
    <div className="w-full bg-white px-2 sm:px-4 lg:px-0">
      <div className="max-w-7xl mx-auto">
        <img
          src="/banner Bookhaven.png"
          alt="Banner"
          className="w-full h-auto 
                     max-h-[200px] sm:max-h-[280px] md:max-h-[360px] lg:max-h-[440px]
                     object-cover 
                     
                     shadow-sm hover:shadow-md transition-shadow duration-300"
        />
      </div>
    </div>
  )
}

export default Banner