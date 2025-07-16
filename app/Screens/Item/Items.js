import React, { useState, useRef } from 'react';
import { View, SafeAreaView, TouchableOpacity, Image, ScrollView, Text, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Octicons from 'react-native-vector-icons/Octicons';
import { GlobalStyleSheet } from '../../constants/StyleSheet';
import SearchBar from '../../components/SearchBar';
import { COLORS, FONTS, IMAGES, SIZES } from '../../constants/theme';
import CardStyle1 from '../../components/Card/CardStyle1';
import FilterSheet from '../../components/BottomSheet/FilterSheet';
import ShortfilterSheet from '../../components/BottomSheet/ShortfilterSheet';
import SortbySheet from '../../components/BottomSheet/SortbySheet';

const ItemData = [
    {
        id: '1',
        image: IMAGES.car6,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '2',
        image: IMAGES.car5,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '3',
        image: IMAGES.car4,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '4',
        image: IMAGES.car3,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '5',
        image: IMAGES.car2,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '6',
        image: IMAGES.car1,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '7',
        image: IMAGES.car6,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
        trending: true,
    },
    {
        id: '8',
        image: IMAGES.car5,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '9',
        image: IMAGES.car4,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '10',
        image: IMAGES.car3,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '11',
        image: IMAGES.car2,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
    {
        id: '12',
        image: IMAGES.car1,
        title: "NIKON CORPORATION, NIKON D5500",
        price: "$1288.50",
        location: "La Molina, Peru",
    },
]

const Data = {
    car: [
        {
            id: '1',
            image: IMAGES.car6,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.car5,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.car4,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.car3,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.car2,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.car1,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '7',
            image: IMAGES.car6,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '8',
            image: IMAGES.car5,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '9',
            image: IMAGES.car4,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '10',
            image: IMAGES.car3,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '11',
            image: IMAGES.car2,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '12',
            image: IMAGES.car1,
            title: "NIKON CORPORATION, NIKON D5500",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
    ],
    Mobile: [
        {
            id: '1',
            image: IMAGES.mobile1,
            title: "Vivo X60 Pro",
            price: "$100.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.mobile2,
            title: "iPhone 12 Pro (2020)",
            price: "$1250.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.mobile3,
            title: "Vivo NEX S",
            price: "$1100.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.mobile4,
            title: "iPhone 13 Pro Max (2021)",
            price: "$130.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.mobile5,
            title: "Oppo Find X3 Pro",
            price: "$140.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.mobile6,
            title: "Oppo F19 Pro+",
            price: "$1658.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.mobile1,
            title: "Vivo X60 Pro",
            price: "$100.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.mobile2,
            title: "iPhone 12 Pro (2020)",
            price: "$1250.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.mobile3,
            title: "Vivo NEX S",
            price: "$1100.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.mobile4,
            title: "iPhone 13 Pro Max (2021)",
            price: "$130.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.mobile5,
            title: "Oppo Find X3 Pro",
            price: "$140.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.mobile6,
            title: "Oppo F19 Pro+",
            price: "$1658.50",
            location: "La Molina, Peru",
        },
    ],
    Properties: [
        {
            id: '1',
            image: IMAGES.properties1,
            title: "Serenity Pines Retreat",
            price: "$12880.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.properties2,
            title: "Tranquil Haven Cottage",
            price: "$12500.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.properties3,
            title: "Sunburst Villa",
            price: "$13000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.properties4,
            title: "Enchanted Ivy Chalet",
            price: "$18000.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.properties5,
            title: "Harmony Hillside Lodge",
            price: "$14500.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.properties6,
            title: "Whispering Willow Manor",
            price: "$766510.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.properties1,
            title: "Serenity Pines Retreat",
            price: "$12880.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.properties2,
            title: "Tranquil Haven Cottage",
            price: "$12500.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.properties3,
            title: "Sunburst Villa",
            price: "$13000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.properties4,
            title: "Enchanted Ivy Chalet",
            price: "$18000.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.properties5,
            title: "Harmony Hillside Lodge",
            price: "$14500.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.properties6,
            title: "Whispering Willow Manor",
            price: "$766510.50",
            location: "La Molina, Peru",
        },
    ],
    Jobs: [
        {
            id: '1',
            image: IMAGES.jobs1,
            title: "Data Entry Clerk",
            price: "$100 - $120",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.jobs2,
            title: "Information Processing Assistant",
            price: "$80 - $110",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.jobs3,
            title: "Word Processor",
            price: "$180 - $200",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.jobs4,
            title: "Web Developer",
            price: "$130 - $150",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.jobs5,
            title: "Software Engineer",
            price: "$150 - $200",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.jobs6,
            title: "Technical Lead",
            price: "$80 - $120",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.jobs1,
            title: "Data Entry Clerk",
            price: "$100 - $120",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.jobs2,
            title: "Information Processing Assistant",
            price: "$80 - $110",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.jobs3,
            title: "Word Processor",
            price: "$180 - $200",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.jobs4,
            title: "Web Developer",
            price: "$130 - $150",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.jobs5,
            title: "Software Engineer",
            price: "$150 - $200",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.jobs6,
            title: "Technical Lead",
            price: "$80 - $120",
            location: "La Molina, Peru",
        },
    ],
    Bike: [
        {
            id: '1',
            image: IMAGES.bike1,
            title: "Yamaha (e.g., YZF-R series, MT series, FZ series)",
            price: "$1285.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.bike2,
            title: "Suzuki (e.g., GSX series, Hayabusa, V-Strom)",
            price: "$1288.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.bike3,
            title: "Royal Enfield Bullet 350",
            price: "$1300.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.bike4,
            title: "Royal Enfield Bullet Electra",
            price: "$1400.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.bike5,
            title: "KTM (e.g., Duke series, Adventure series)",
            price: "$1550.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.bike6,
            title: "Royal Enfield (e.g., Classic, Bullet, Himalayan)",
            price: "$10000.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.bike1,
            title: "Yamaha (e.g., YZF-R series, MT series, FZ series)",
            price: "$1285.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.bike2,
            title: "Suzuki (e.g., GSX series, Hayabusa, V-Strom)",
            price: "$1288.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.bike3,
            title: "Royal Enfield Bullet 350",
            price: "$1300.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.bike4,
            title: "Royal Enfield Bullet Electra",
            price: "$1400.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.bike5,
            title: "KTM (e.g., Duke series, Adventure series)",
            price: "$1550.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.bike6,
            title: "Royal Enfield (e.g., Classic, Bullet, Himalayan)",
            price: "$10000.50",
            location: "La Molina, Peru",
        },
    ],
    Electornics: [
        {
            id: '1',
            image: IMAGES.electronics1,
            title: " numerous washing machine LG",
            price: "$1352.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.electronics2,
            title: "HP laptop",
            price: "$1000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.electronics3,
            title: "DJI (Dà-Jiāng Innovations Science and Technology Co., Ltd.)",
            price: "$1088.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.electronics4,
            title: "LG microwave ovens",
            price: "$1588.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.electronics5,
            title: "Tea machine",
            price: "$158.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.electronics6,
            title: "LG fane",
            price: "$128.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.electronics1,
            title: " numerous washing machine LG",
            price: "$1352.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.electronics2,
            title: "HP laptop",
            price: "$1000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.electronics3,
            title: "DJI (Dà-Jiāng Innovations Science and Technology Co., Ltd.)",
            price: "$1088.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.electronics4,
            title: "LG microwave ovens",
            price: "$1588.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.electronics5,
            title: "Tea machine",
            price: "$158.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.electronics6,
            title: "LG fane",
            price: "$128.50",
            location: "La Molina, Peru",
        },
    ],
    Furniture: [
        {
            id: '1',
            image: IMAGES.furniture1,
            title: "Sofa",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.furniture2,
            title: "Coffee table",
            price: "$1308.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.furniture3,
            title: "Nightstand",
            price: "$1208.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.furniture4,
            title: "Office table",
            price: "$1118.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.furniture5,
            title: "Dining table",
            price: "$1508.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.furniture6,
            title: "Vanity table",
            price: "$1808.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.furniture1,
            title: "Sofa",
            price: "$1288.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.furniture2,
            title: "Coffee table",
            price: "$1308.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.furniture3,
            title: "Nightstand",
            price: "$1208.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.furniture4,
            title: "Office table",
            price: "$1118.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.furniture5,
            title: "Dining table",
            price: "$1508.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.furniture6,
            title: "Vanity table",
            price: "$1808.50",
            location: "La Molina, Peru",
        },
    ],
    Fashion: [
        {
            id: '1',
            image: IMAGES.faction1,
            title: "Leather Jacket",
            price: "$120.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.faction2,
            title: "Jackets",
            price: "$130.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.faction3,
            title: "Zara T-shirt",
            price: "$155.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.faction4,
            title: "Denim short",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.faction5,
            title: "Boys jeans",
            price: "$113.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.faction6,
            title: "Trench Coat",
            price: "$1280.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.faction1,
            title: "Leather Jacket",
            price: "$120.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.faction2,
            title: "Jackets",
            price: "$130.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.faction3,
            title: "Zara T-shirt",
            price: "$155.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.faction4,
            title: "Denim short",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.faction5,
            title: "Boys jeans",
            price: "$113.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.faction6,
            title: "Trench Coat",
            price: "$1280.50",
            location: "La Molina, Peru",
        },
    ],
    Pets: [
        {
            id: '1',
            image: IMAGES.pet1,
            title: "Bulldog (English Bulldog, French Bulldog)",
            price: "$1280.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.pet2,
            title: "Scottish Fold, Cat",
            price: "$1100.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.pet3,
            title: "Monkey Shoulder: A brand of blended malt Scotch whisky.",
            price: "$14000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.pet4,
            title: "Houres",
            price: "$12500.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.pet5,
            title: "Robin brid",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.pet6,
            title: "Ostrich parrot",
            price: "$1300.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.pet1,
            title: "Bulldog (English Bulldog, French Bulldog)",
            price: "$1280.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.pet2,
            title: "Scottish Fold, Cat",
            price: "$1100.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.pet3,
            title: "Monkey Shoulder: A brand of blended malt Scotch whisky.",
            price: "$14000.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.pet4,
            title: "Houres",
            price: "$12500.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.pet5,
            title: "Robin brid",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.pet6,
            title: "Ostrich parrot",
            price: "$1300.50",
            location: "La Molina, Peru",
        },
    ],
    Books: [
        {
            id: '1',
            image: IMAGES.books1,
            title: "'Midnight's Children' by Salman Rushdie",
            price: "$125.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.books2,
            title: "'The God of Small Things' by Arundhati Roy",
            price: "$110.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.books3,
            title: "'The White Tiger' by Aravind Adiga",
            price: "$108.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.books4,
            title: "'Train to Pakistan' by Khushwant Singh",
            price: "$105.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.books5,
            title: "'The Discovery of India' by Jawaharlal Nehru",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.books6,
            title: "'Interpreter of Maladies' by Jhumpa Lahiri",
            price: "$178.50",
            location: "La Molina, Peru",
        },
        {
            id: '1',
            image: IMAGES.books1,
            title: "'Midnight's Children' by Salman Rushdie",
            price: "$125.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.books2,
            title: "'The God of Small Things' by Arundhati Roy",
            price: "$110.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.books3,
            title: "'The White Tiger' by Aravind Adiga",
            price: "$108.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.books4,
            title: "'Train to Pakistan' by Khushwant Singh",
            price: "$105.50",
            location: "La Molina, Peru",
        },
        {
            id: '5',
            image: IMAGES.books5,
            title: "'The Discovery of India' by Jawaharlal Nehru",
            price: "$150.50",
            location: "La Molina, Peru",
        },
        {
            id: '6',
            image: IMAGES.books6,
            title: "'Interpreter of Maladies' by Jhumpa Lahiri",
            price: "$178.50",
            location: "La Molina, Peru",
        },
    ],
    Service: [
        {
            id: '1',
            image: IMAGES.service1,
            title: "pincle droing (Dog)",
            price: "$1308.50",
            location: "La Molina, Peru",
        },
        {
            id: '2',
            image: IMAGES.service2,
            title: "Cannondale bicycle",
            price: "$125.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '3',
            image: IMAGES.service3,
            title: "Audemars Piguet, watch",
            price: "$1888.50",
            location: "La Molina, Peru",
            trending: true,
        },
        {
            id: '4',
            image: IMAGES.service4,
            title: "Yamaha, Piano",
            price: "$12808.50",
            location: "La Molina, Peru",
        },
    ],
}


const Items = ({ route, navigation }) => {

    const { cat } = route.params;

    const { colors } = useTheme();

    const [layout, setLayout] = useState('grid');

    const handleLayout = (val) => {
        setLayout(val);
    }

    const sheetRef = useRef();

    const moreRef = useRef();

    const openRef = useRef();

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background
            }}
        >
            <View
                style={[GlobalStyleSheet.container, { paddingBottom: 5 }]}
            >
                <View
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <View
                        style={{
                            flex: 1
                        }}
                    >
                        <SearchBar />
                    </View>
                    <TouchableOpacity
                        style={{
                            padding: 14,
                            marginLeft: 5,
                        }}
                        onPress={() => sheetRef.current.openSheet()}
                    >
                        <Image
                            style={{
                                height: 20,
                                width: 20,
                                resizeMode: 'contain',
                                tintColor: colors.title,
                            }}
                            source={IMAGES.filter}
                        />
                    </TouchableOpacity>
                </View>

                <View
                    style={{
                        backgroundColor: colors.card,
                        marginHorizontal: -15,
                        flexDirection: 'row',
                        marginTop: 10,
                        height: 54,
                        alignItems: 'center',
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingLeft: 15,
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    borderWidth: 1,
                                    borderColor: colors.borderColor,
                                    borderRadius: SIZES.radius,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    marginRight: 8,
                                }}
                                onPress={() => openRef.current.openSheet()}
                            >
                                <Octicons size={16} color={colors.textLight} style={{ marginRight: 6 }} name='sort-desc' />
                                <Text style={[FONTS.fontSm, { color: colors.title, marginRight: 4 }]}>Sort By</Text>
                                <FeatherIcon color={colors.text} size={18} name="chevron-down" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    borderWidth: 1,
                                    borderColor: colors.borderColor,
                                    borderRadius: SIZES.radius,
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    marginRight: 8,
                                }}
                                onPress={() => moreRef.current.openSheet()}
                            >
                                <Text style={[FONTS.fontSm, { color: colors.title, marginRight: 4 }]}>Year</Text>
                                <FeatherIcon color={colors.text} size={18} name="chevron-down" />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => handleLayout('grid')}
                            style={{
                                padding: 10,
                            }}
                        >
                            <Image
                                style={{
                                    height: 22,
                                    width: 22,
                                    resizeMode: 'contain',
                                    tintColor: layout === 'grid' ? COLORS.primary : '#BEB9CD',
                                }}
                                source={IMAGES.grid}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleLayout('list')}
                            style={{
                                padding: 10,
                            }}
                        >
                            <Image
                                style={{
                                    height: 22,
                                    width: 22,
                                    resizeMode: 'contain',
                                    tintColor: layout === 'list' ? COLORS.primary : '#BEB9CD',
                                }}
                                source={IMAGES.grid2}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            <ScrollView showsHorizontalScrollIndicator={false}>
                <View 
                    style={[GlobalStyleSheet.container,{
                        padding:0, 
                        flexDirection: layout === 'list' ? 'column' : 'row', 
                        flexWrap: layout === 'list' ? 'nowrap' : 'wrap', 
                        paddingHorizontal: 10 
                    }]}
                >
                    {Data[cat].map((data, index) => (
                        <View
                            key={index}
                            style={[{ marginBottom: 10 }, layout === 'grid' && [GlobalStyleSheet.col50, { marginBottom: 15 }]]}
                        >
                            <CardStyle1
                                list={layout === 'list' ? true : false}
                                item={data}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
            <FilterSheet
                ref={sheetRef}
                height={false}
            />
            <ShortfilterSheet
                ref={moreRef}
            />
            <SortbySheet
                ref={openRef}
            />
        </SafeAreaView>
    )
}

export default Items;