import { ScrollView, ScrollViewProps } from 'react-native';
import React, { ReactNode } from 'react';
import { ViewStyle } from 'react-native';

interface ScrollAreaProps extends ScrollViewProps {
    children: ReactNode;
    className?: string;
    contentContainerStyle?: ViewStyle;
}

export function ScrollArea({
                               children,
                               className,
                               contentContainerStyle,
                               ...props
                           }: ScrollAreaProps) {
    return (
        <ScrollView
            {...props}
            className={`scroll-area ${className}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{ paddingBottom: 24 }, contentContainerStyle]}
        >
            {children}
        </ScrollView>
    );
}