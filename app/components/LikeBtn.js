import React, { useState } from 'react';
import { Pressable } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS } from '../constants/theme';


const LikeBtn = () => {

    const [isLike , setIsLike] = useState(false);    

    return (
        <Pressable
            accessible={true}
            accessibilityLabel="Like Btn"
            accessibilityHint="Like this item"
            onPress={() => {setIsLike(!isLike)}}
            style={{
                height:50,
                width:50,
                alignItems:'center',
                justifyContent:'center',
            }}    
        >
            {isLike ?
                <FontAwesome size={16} color={COLORS.danger} name="heart"/>
                :
                <FontAwesome size={16} color={COLORS.white} name="heart-o"/>
            }
        </Pressable>
    );
};


export default LikeBtn;