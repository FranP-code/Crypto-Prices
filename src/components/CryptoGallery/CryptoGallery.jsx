import React, { useState } from 'react';
import { Grid } from '@mui/material';
import styled from 'styled-components';
import CryptoGalleryItem from './CryptoGalleryItem';

import moment from 'moment';
import getCryptocurrencyData from './API calls/getCryptocurrencyData';
import getCryptoPrices from './API calls/getCryptoPrices';

const CryptoGallery = ({setLoading, setLoadingURL, loading}) => {

    const CryptosStyles = styled.div`

        position: relative;
        
        /* height: ${props => props.loading ? '1px' : 'auto'}; */

        z-index: 100;

        margin-top: 5vh;

        .grid {

            padding: 0px 10vw;
        }

        .item {

            /* width: 100px; */
            height: 100px;

            background: #101116;
        }
    `
    const CryptoStyles = styled(Grid)` // https://stackoverflow.com/questions/68248337/how-to-override-material-ui-css-with-styled-component

        .card {

            background: rgba( 78, 159, 255, 0);
            backdrop-filter: blur( 14px );
                -webkit-backdrop-filter: blur( 14px );

            
        }

        .container {
            background: rgba( 78, 159, 255, 0.25 );
            backdrop-filter: blur( 14px );
            -webkit-backdrop-filter: blur( 14px );
            border-radius: 10px;
            border: 1px solid rgba( 255, 255, 255, 0.18 );
            /* height: 80vh; */
            user-select: none;
            cursor: pointer;
            transition: 0.25s ease-in-out;

            :hover {
                background: #21202950;
            }

            .line {

                /* height: 38vh !important; */
                /* width: 54.19vh !important;  */
                margin-top: 10vh;
                /* margin-bottom: 5vh; */
                /* margin-bottom: 10vh; */
                cursor: initial;
            }
        }
    `
    const [cryptosPrices, setCryptosPrices] = useState(false)
    const [cryptosList, setCryptosList] = useState(false)

    const [dates, setDates] = useState([])    

    const generateArrayOfDates = () => {

        //Generate array of dates

        let datesArray = []

        for (let i = 0; i < 7; i++) {
            
            datesArray.push(moment().subtract(i, 'days').format('DD-MM')) 
        }

        datesArray.reverse()
        return datesArray
    }

    const effectHandler = async () => {

        const data = await getCryptocurrencyData()
        setCryptosList(data)

        const lastDayPrices = localStorage.getItem('lastDayPrices')
        const actualDay = moment().format('DD-MM-YYYY')

        setDates(generateArrayOfDates())

        // In the case the las day prices are today, just restore them from Local Storage
        if (lastDayPrices === actualDay) {

            const prices = JSON.parse(localStorage.getItem('prices'))

            setCryptosPrices(prices)
            
            return
        }

        // If not, extract all them from the API

        let cryptoPricesCopy = []

        async function asyncForEach(array, callback) {
            for (let i = 0; i < array.length; i++) {
              await callback(array[i], i, array);
            }
        } // Credits https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
          
        await asyncForEach(data, async (object) => {

            setLoadingURL(object.image)

            let requestData = await getCryptoPrices(object)

            requestData = requestData.map(arr => {

                return [arr[1], arr[1]]
                
            })


            let objectResult = {}
            objectResult[object.id] = {}
            objectResult[object.id].prices = requestData
            cryptoPricesCopy.push(objectResult)
        })

        await setCryptosPrices(await cryptoPricesCopy)
    }
    
    React.useEffect(() => {
        

        effectHandler()
        
    }, [])

    React.useEffect(() => {

        //Once prices are loaded into the state...
        if (cryptosPrices) {
            
            //Almacenate prices on LocalStorage
            const jsonString = JSON.stringify(cryptosPrices)
            localStorage.setItem('prices', jsonString)

            //Almacenate actual day on LocalStorage
            const actualDay = moment().format('DD-MM-YYYY')
            localStorage.setItem('lastDayPrices', actualDay)
        }    
    }, [cryptosPrices])

    return (
        <>
        {
            cryptosPrices ? 
                <CryptosStyles>
                        <Grid container columnSpacing={4} rowSpacing={6} className='grid'>
                            {
                                cryptosList.map((crypto, index) => (
                                    <CryptoGalleryItem
                                        CryptoStyles={CryptoStyles}
                                        data={crypto}
                                        cryptoPrices={cryptosPrices[index]}
                                        key={crypto.id}
                                        dates={dates}

                                        index={index}
                                        cryptoListLength={cryptosList.length}

                                        loading={loading}
                                        setLoading={setLoading}
                                    />                                    
                                ))
                            }
                        </Grid>
                </CryptosStyles>
            : null
        }

        </>
        );
};

export default CryptoGallery;
