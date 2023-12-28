import { FiltersButton } from "../../consts"
import { filterValue } from "../../types"

//DEFINE PROPS
interface Props {
    onFilterChange: (filter: filterValue) => void
    filterSelected: filterValue
}

export const Filters: React.FC<Props> = ({
    filterSelected,
    onFilterChange
}) => {

    return (
        <ul className="filters mb-3">
            {
                //ITERATES OVER THE ENTRIES OF FILTERSBUTTON
                Object.entries(FiltersButton).map(([key, { href, literal }]) => {

                    //DETERMINES IF THE CURRENT BUTTON IS SELECTED
                    const isSelected = key == filterSelected

                    //ASSIGNS A CONDITIONAL CLASS TO HIGHLIGTH THE SELECTED BUTTON
                    const className = isSelected ? 'selected' : ''

                    return (
                        //RENDER A LIST ITEM WITH A LINK
                        <li key={key}>
                            <a
                                href={href}
                                className={className}
                                onClick={(e) => {
                                    e.preventDefault()
                                    onFilterChange(key as filterValue)
                                }}
                            >
                                {literal}
                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )
}

