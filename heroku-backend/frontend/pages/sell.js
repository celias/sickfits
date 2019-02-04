import CreateItem from '../components/CreateItem';
import PleaseSignin from '../components/PleaseSignin';

const Sell = props => {
    return (
        <div>
            <PleaseSignin>
                <CreateItem />
            </PleaseSignin>

        </div>
    )
}

export default Sell; 