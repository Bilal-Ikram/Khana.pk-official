import Navbar from '../Navbar/Navbar'
import HeroSection from '../Hero Section/HeroSection'
import CityGrid from '../City Grid/CityGrid'
import RestaurantListing from '../RestaurantListing/RestaurantListing'
import Footer from '../Footer/Footer'
import React from 'react'

const Home = () => {
  return (
    <div>
      <HeroSection/>
      <RestaurantListing/>
      <CityGrid/>
      <Footer/>
    </div>
  )
}

export default Home
