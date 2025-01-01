import "Counter"
import "NumberFormatter"

access(all)
fun main(): String {
    // Retrieve the count from the Counter contract
    let count: Int = Counter.getCount()

    // Format the count using NumberFormatter
    let formattedCount = NumberFormatter.formatWithCommas(number: count)

    // Return the formatted count
    return formattedCount
}
