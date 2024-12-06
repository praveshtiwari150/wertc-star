export const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER;

export interface Participant {
    peerId: string;
    peerName: string;
    status: 'accepted' | 'pending';
}

export const dummyParticipants: Participant[] = [
    { peerId: '1', peerName: 'Alice', status: 'accepted' },
    { peerId: '2', peerName: 'Bob', status: 'pending' },
    { peerId: '3', peerName: 'Charlie', status: 'accepted' },
    { peerId: '4', peerName: 'Diana', status: 'pending' },
    { peerId: '5', peerName: 'Edward', status: 'accepted' },
    { peerId: '6', peerName: 'Fiona', status: 'pending' },
    { peerId: '7', peerName: 'George', status: 'accepted' },
    { peerId: '8', peerName: 'Hannah', status: 'pending' },
    { peerId: '9', peerName: 'Ian', status: 'accepted' },
    { peerId: '10', peerName: 'Jill', status: 'pending' },
    { peerId: '11', peerName: 'Karen', status: 'accepted' },
    { peerId: '12', peerName: 'Larry', status: 'pending' },
    { peerId: '13', peerName: 'Mona', status: 'accepted' },
    { peerId: '14', peerName: 'Nathan', status: 'pending' },
    { peerId: '15', peerName: 'Olivia', status: 'accepted' },
    { peerId: '16', peerName: 'Paul', status: 'pending' },
    { peerId: '17', peerName: 'Quincy', status: 'accepted' },
    { peerId: '18', peerName: 'Rachel', status: 'pending' },
    { peerId: '19', peerName: 'Steve', status: 'accepted' },
    { peerId: '20', peerName: 'Tina', status: 'pending' },
    { peerId: '21', peerName: 'Ursula', status: 'accepted' },
    { peerId: '22', peerName: 'Victor', status: 'pending' },
    { peerId: '23', peerName: 'Wendy', status: 'accepted' },
    { peerId: '24', peerName: 'Xander', status: 'pending' },
    { peerId: '25', peerName: 'Yvonne', status: 'accepted' },
    { peerId: '26', peerName: 'Zack', status: 'pending' },
    { peerId: '27', peerName: 'Anna', status: 'accepted' },
    { peerId: '28', peerName: 'Brian', status: 'pending' },
    { peerId: '29', peerName: 'Clara', status: 'accepted' },
    { peerId: '30', peerName: 'David', status: 'pending' }
];


