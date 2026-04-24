import {
    Flex,
    Text
}                           from '@radix-ui/themes';
import { Check }            from 'lucide-react';
import type { TripStatus, } from '@/lib/dto/trip.dto';
import {
    TRIP_STATUS_LABELS,
    TRIP_STATUS_PIPELINE,
}                           from '@/lib/dto/trip.dto';

interface TripPipelineProps {
    status: TripStatus;
}

export function TripPipeline({ status }: TripPipelineProps): React.ReactElement {
    const currentIdx = TRIP_STATUS_PIPELINE.indexOf(status);

    return (
        <Flex align="center" gap="0" style={ { overflowX: 'auto' } }>
            { TRIP_STATUS_PIPELINE.map((step, idx) => {
                const done = idx < currentIdx;
                const active = idx === currentIdx;

                return (
                    <Flex key={ step } align="center" style={ { flexShrink: 0 } }>
                        <Flex direction="column" align="center" gap="1">
                            <Flex
                                align="center"
                                justify="center"
                                style={ {
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: done
                                        ? 'var(--accent-9)'
                                        : active
                                            ? 'var(--accent-3)'
                                            : 'var(--gray-4)',
                                    color: done ? 'white' : active ? 'var(--accent-11)' : 'var(--gray-10)',
                                    border: active ? '2px solid var(--accent-9)' : '2px solid transparent',
                                    fontSize: 12,
                                    fontWeight: 600,
                                } }
                            >
                                { done ? <Check size={ 14 }/> : idx + 1 }
                            </Flex>
                            <Text
                                size="1"
                                weight={ active ? 'bold' : 'regular' }
                                color={ done || active ? undefined : 'gray' }
                                style={ { whiteSpace: 'nowrap', maxWidth: 90, textAlign: 'center' } }
                            >
                                { TRIP_STATUS_LABELS[step] }
                            </Text>
                        </Flex>

                        { idx < TRIP_STATUS_PIPELINE.length - 1 && (
                            <div
                                style={ {
                                    height: 2,
                                    width: 48,
                                    background: done ? 'var(--accent-9)' : 'var(--gray-4)',
                                    marginBottom: 20,
                                    flexShrink: 0,
                                } }
                            />
                        ) }
                    </Flex>
                );
            }) }
        </Flex>
    );
}
